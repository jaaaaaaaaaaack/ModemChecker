import { describe, it, expect } from "vitest";
import { assessCompatibility } from "../../src/lib/compatibility";
import type { Modem } from "../../src/types";

const makeModem = (overrides: Partial<Modem> = {}): Modem => ({
  id: "test-modem",
  brand: "TestBrand",
  model: "TestModel",
  alternative_names: null,
  device_type: "modem_router",
  isp_provided_by: null,
  is_isp_locked: false,
  compatibility: {
    fttp: { status: "yes", conditions: [] },
    fttc: { status: "yes", conditions: [] },
    fttn: { status: "yes", conditions: [] },
    hfc: { status: "yes", conditions: [] },
  },
  wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
  wifi: {
    wifi_standard: "Wi-Fi 6",
    wifi_generation: 6,
    bands: ["2.4GHz", "5GHz"],
    max_speed_mbps: {
      theoretical_combined: 3000,
      per_band: { "2.4GHz": 574, "5GHz": 2402 },
    },
  },
  general: {
    release_year: 2021,
    still_sold: true,
    end_of_life: false,
    manufacturer_url: null,
  },
  ...overrides,
});

describe("assessCompatibility", () => {
  it("returns not-compatible for status 'no' regardless of speed data", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "no", conditions: [] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result).toEqual({
      cardStatus: "not-compatible",
      speedWarning: null,
      setupConditions: [],
    });
  });

  it("returns compatible when status is yes and no speed issues", () => {
    const modem = makeModem();
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result).toEqual({
      cardStatus: "compatible",
      speedWarning: null,
      setupConditions: [],
    });
  });

  it("returns speed-warning with wan-bottleneck when WAN < plan speed", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("speed-warning");
    expect(result.speedWarning).toEqual({ type: "wan-bottleneck" });
  });

  it("returns speed-warning with wifi-bottleneck when best band < plan speed * 2", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
      wifi: {
        wifi_standard: "Wi-Fi 5",
        wifi_generation: 5,
        bands: ["2.4GHz", "5GHz"],
        max_speed_mbps: {
          theoretical_combined: 1167,
          per_band: { "2.4GHz": 300, "5GHz": 867 },
        },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("speed-warning");
    expect(result.speedWarning).toEqual({ type: "wifi-bottleneck" });
  });

  it("returns callout when status is yes_but with setup conditions only", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE", "DISABLE_VLAN"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("callout");
    expect(result.speedWarning).toBeNull();
    expect(result.setupConditions).toEqual(["SWITCH_TO_IPOE", "DISABLE_VLAN"]);
  });

  it("returns speed-warning when both speed and setup conditions exist", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.cardStatus).toBe("speed-warning");
    expect(result.speedWarning).toEqual({ type: "wan-bottleneck" });
    expect(result.setupConditions).toEqual(["SWITCH_TO_IPOE"]);
  });

  it("wan-bottleneck takes precedence over wifi-bottleneck", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
      wifi: {
        wifi_standard: "Wi-Fi 5",
        wifi_generation: 5,
        bands: ["5GHz"],
        max_speed_mbps: {
          theoretical_combined: 867,
          per_band: { "5GHz": 867 },
        },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.speedWarning).toEqual({ type: "wan-bottleneck" });
  });

  it("filters speed condition codes from setup conditions", () => {
    const modem = makeModem({
      compatibility: {
        fttp: {
          status: "yes_but",
          conditions: ["WAN_PORT_LIMIT", "SWITCH_TO_IPOE", "NEEDS_2_5G_WAN"],
        },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.setupConditions).toEqual(["SWITCH_TO_IPOE"]);
  });

  it("handles empty per_band object without wifi warning", () => {
    const modem = makeModem({
      wifi: {
        wifi_standard: "Wi-Fi 6",
        wifi_generation: 6,
        bands: [],
        max_speed_mbps: { theoretical_combined: 0, per_band: {} },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.speedWarning).toBeNull();
  });

  it("handles per_band speed of 0 without wifi warning", () => {
    const modem = makeModem({
      wifi: {
        wifi_standard: "Wi-Fi 5",
        wifi_generation: 5,
        bands: ["5GHz"],
        max_speed_mbps: {
          theoretical_combined: 0,
          per_band: { "5GHz": 0 },
        },
      },
    });
    const result = assessCompatibility(modem, "fttp", 500);
    expect(result.speedWarning).toBeNull();
  });

  it("fires no speed warnings when planSpeedMbps is 0", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 100 },
    });
    const result = assessCompatibility(modem, "fttp", 0);
    expect(result.speedWarning).toBeNull();
  });
});
