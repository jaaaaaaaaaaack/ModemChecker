import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultipleMatches } from "../../src/components/MultipleMatches";
import type { Modem } from "../../src/types";

const makeModem = (id: string, model: string): Modem => ({
  id,
  brand: "TP-Link",
  model,
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
    bands: [],
    max_speed_mbps: { theoretical_combined: 0, per_band: {} },
  },
  general: {
    release_year: null,
    still_sold: false,
    end_of_life: false,
    manufacturer_url: null,
  },
});

const modems = [makeModem("a", "Archer VR1600v"), makeModem("b", "Archer C7")];

describe("MultipleMatches", () => {
  it("renders heading and all modem options", () => {
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
    );
    expect(screen.getByText(/multiple matches/i)).toBeInTheDocument();
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText("Archer C7")).toBeInTheDocument();
  });

  it("Continue button is aria-disabled until a modem is selected", () => {
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
    );
    expect(
      screen.getByRole("button", { name: /continue/i })
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("clicking Continue while aria-disabled does not call onSelect", async () => {
    const onSelect = vi.fn();
    render(
      <MultipleMatches modems={modems} onSelect={onSelect} onBack={() => {}} />
    );
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("calls onSelect with chosen modem on Continue", async () => {
    const onSelect = vi.fn();
    render(
      <MultipleMatches modems={modems} onSelect={onSelect} onBack={() => {}} />
    );
    await userEvent.click(screen.getByText("Archer C7"));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onSelect).toHaveBeenCalledWith(modems[1]);
  });

  it("calls onBack when back button clicked", async () => {
    const onBack = vi.fn();
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={onBack} />
    );
    const backButton = screen.getByLabelText(/back/i);
    await userEvent.click(backButton);
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} onClose={onClose} />
    );
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not render close button when onClose is omitted", () => {
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
    );
    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });
});
