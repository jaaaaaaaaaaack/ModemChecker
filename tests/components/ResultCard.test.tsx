import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("calls onDone when close button clicked", async () => {
    const onDone = vi.fn();
    render(<ResultCard modem={makeModem()} techType="fttp" onDone={onDone} />);
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onDone).toHaveBeenCalledOnce();
  });

  it("shows speed warning headline for WAN bottleneck", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 100 },
    });
    render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
    expect(
      screen.getByText(/not fast enough to support your plan/i)
    ).toBeInTheDocument();
  });

  it("shows speed warning headline for Wi-Fi bottleneck", () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 1000 },
      wifi: {
        wifi_standard: "Wi-Fi 5",
        wifi_generation: 5,
        bands: ["5GHz"],
        max_speed_mbps: { theoretical_combined: 867, per_band: { "5GHz": 867 } },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
    expect(
      screen.getByText(/may not be capable of supporting.*over Wi-Fi/i)
    ).toBeInTheDocument();
  });

  it("shows callout headline for setup conditions without speed issues", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
    expect(screen.getByText("Compatible with some requirements")).toBeInTheDocument();
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
  });
});
