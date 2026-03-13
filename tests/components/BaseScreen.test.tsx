import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseScreen } from "../../src/components/BaseScreen";
import type { Modem } from "../../src/types";

describe("BaseScreen", () => {
  const makeModem = (overrides: Partial<Modem> = {}): Modem => ({
    id: "tp-link-archer-vr1600v",
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
    wifi: {
      wifi_standard: "Wi-Fi 5",
      wifi_generation: 5,
      bands: ["2.4GHz", "5GHz"],
      max_speed_mbps: { theoretical_combined: 1733, per_band: { "2.4GHz": 450, "5GHz": 1300 } },
    },
    general: { release_year: 2018, still_sold: false, end_of_life: false, manufacturer_url: null },
    ...overrides,
  });

  it("renders modem selection heading", () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    expect(screen.getByText(/modem selection/i)).toBeInTheDocument();
  });

  it("does not show BYO section before selecting BYO", () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    expect(screen.queryByText(/check your modem/i)).not.toBeInTheDocument();
  });

  it("shows check your modem button when BYO selected", async () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    expect(screen.getByRole("button", { name: /check your modem/i })).toBeInTheDocument();
  });

  it("calls onCheckModem when check button clicked", async () => {
    const onCheck = vi.fn();
    render(<BaseScreen onCheckModem={onCheck} />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    await userEvent.click(screen.getByRole("button", { name: /check your modem/i }));
    expect(onCheck).toHaveBeenCalledOnce();
  });

  it("shows verified modem info when provided", async () => {
    const modem = makeModem();
    render(
      <BaseScreen onCheckModem={() => {}} verifiedModem={modem} techType="fttp" planSpeedMbps={500} />
    );
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText("TP-Link")).toBeInTheDocument();
    expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
  });

  it("shows speed warning for modem with slow WAN", async () => {
    const modem = makeModem({
      wan: { has_vdsl2_modem: true, wan_port_speed_mbps: 100 },
    });
    render(
      <BaseScreen onCheckModem={() => {}} verifiedModem={modem} techType="fttp" planSpeedMbps={500} />
    );
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    expect(screen.getByText(/not fast enough to support/i)).toBeInTheDocument();
  });
});
