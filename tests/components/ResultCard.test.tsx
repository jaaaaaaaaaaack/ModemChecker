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
    expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
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
    expect(screen.getByText(/modem is not compatible/i)).toBeInTheDocument();
  });

  it("absorbs setup conditions into generic callout for yes_but status", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" />);
    expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
    expect(screen.getByText("Some setup required")).toBeInTheDocument();
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });

  it("displays modem brand and model separately", () => {
    render(<ResultCard modem={makeModem()} techType="fttp" />);
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText("TP-Link")).toBeInTheDocument();
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

  it("shows generic callout for setup conditions without individual items", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
    expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
    expect(screen.getByText("Some setup required")).toBeInTheDocument();
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });

  it("shows ISP_LOCK individually alongside generic callout", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes_but", conditions: ["SWITCH_TO_IPOE", "ISP_LOCK"] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "yes", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" planSpeedMbps={500} />);
    expect(screen.getByText("Some setup required")).toBeInTheDocument();
    expect(screen.getByText("May be ISP-locked")).toBeInTheDocument();
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });

  it("renders 'Add a Belong modem' as a link when incompatible and calls onAddBelongModem", async () => {
    const onAddBelongModem = vi.fn();
    const modem = makeModem({
      compatibility: {
        fttp: { status: "no", conditions: [] },
        fttc: { status: "no", conditions: [] },
        fttn: { status: "no", conditions: [] },
        hfc: { status: "no", conditions: [] },
      },
    });
    render(
      <ResultCard
        modem={modem}
        techType="fttp"
        onAddBelongModem={onAddBelongModem}
      />
    );
    const link = screen.getByText(/Add a Belong modem/i);
    expect(link).toBeInTheDocument();
    await userEvent.click(link);
    expect(onAddBelongModem).toHaveBeenCalledOnce();
  });

  it("shows FTTN-specific description when modem is incompatible on fttn", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "yes", conditions: [] },
        fttc: { status: "yes", conditions: [] },
        fttn: { status: "no", conditions: [] },
        hfc: { status: "yes", conditions: [] },
      },
      wan: { has_vdsl2_modem: false, wan_port_speed_mbps: 1000 },
    });
    render(<ResultCard modem={modem} techType="fttn" />);
    expect(
      screen.getByText(/won\u2019t work with your home\u2019s nbn connection type/i)
    ).toBeInTheDocument();
  });

  it("does not render cross-link button when onAddBelongModem is not provided", () => {
    const modem = makeModem({
      compatibility: {
        fttp: { status: "no", conditions: [] },
        fttc: { status: "no", conditions: [] },
        fttn: { status: "no", conditions: [] },
        hfc: { status: "no", conditions: [] },
      },
    });
    render(<ResultCard modem={modem} techType="fttp" />);
    // Text should exist as plain text, not as a button
    expect(screen.getByText(/Add a Belong modem/i)).toBeInTheDocument();
    expect(screen.getByText(/Add a Belong modem/i).tagName).not.toBe("BUTTON");
  });
});
