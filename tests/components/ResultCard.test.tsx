import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultCard } from "../../src/components/ResultCard";
import type { Modem } from "../../src/types";

const makeModem = (overrides: Partial<Modem> = {}): Modem => ({
  id: "test",
  brand: "TP-Link",
  model: "Archer VR1600v",
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
  wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
  wifi: { wifi_standard: "Wi-Fi 5", wifi_generation: 5, bands: [], max_speed_mbps: { theoretical_combined: 0, per_band: {} } },
  general: { release_year: null, still_sold: false, end_of_life: false, manufacturer_url: null },
  ...overrides,
});

describe("ResultCard", () => {
  it("shows compatible heading for yes status", () => {
    render(<ResultCard modem={makeModem()} techType="fttp" />);
    expect(screen.getByText("Compatible with Belong nbn")).toBeInTheDocument();
  });

  it("shows incompatible heading for no status", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "no", conditions: [] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" />);
    expect(screen.getByText("Not compatible with Belong nbn")).toBeInTheDocument();
  });

  it("shows conditions for yes_but status", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" />);
    expect(screen.getByText("Compatible with some requirements")).toBeInTheDocument();
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
  });

  it("displays modem brand and model", () => {
    render(<ResultCard modem={makeModem()} techType="fttp" />);
    expect(screen.getByText("TP-Link")).toBeInTheDocument();
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
  });
});
