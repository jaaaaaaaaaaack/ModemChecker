import { describe, it, expect } from "vitest";
import type {
  TechType,
  CompatibilityStatus,
  ConditionCode,
  Compatibility,
  Modem,
  SearchState,
} from "../src/types";

describe("types", () => {
  it("TechType covers all nbn types", () => {
    const types: TechType[] = ["fttp", "fttc", "fttn", "hfc"];
    expect(types).toHaveLength(4);
  });

  it("CompatibilityStatus covers all statuses", () => {
    const statuses: CompatibilityStatus[] = ["yes", "yes_but", "no"];
    expect(statuses).toHaveLength(3);
  });

  it("Modem type matches database shape", () => {
    const modem: Modem = {
      id: "tp-link-archer-vr1600v",
      brand: "TP-Link",
      model: "Archer VR1600v",
      alternative_names: ["VR1600v"],
      device_type: "modem_router",
      isp_provided_by: null,
      is_isp_locked: false,
      compatibility: {
        fttp: { status: "yes", conditions: [] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
      wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
      wifi: {
        wifi_standard: "Wi-Fi 5 (802.11ac)",
        wifi_generation: 5,
        bands: ["2.4GHz", "5GHz"],
        max_speed_mbps: { theoretical_combined: 1600, per_band: { "2.4ghz": 300, "5ghz": 1300 } },
      },
      general: {
        release_year: 2019,
        still_sold: false,
        end_of_life: false,
        manufacturer_url: null,
      },
    };
    expect(modem.id).toBe("tp-link-archer-vr1600v");
  });

  it("SearchState covers all flow states", () => {
    const states: SearchState["step"][] = [
      "idle",
      "searching",
      "single_match",
      "multiple_matches",
      "no_match",
    ];
    expect(states).toHaveLength(5);
  });
});
