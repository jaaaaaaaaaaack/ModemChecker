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
  it("renders heading and all modem options as buttons", () => {
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
    );
    expect(screen.getByText("Select your modem")).toBeInTheDocument();
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText("Archer C7")).toBeInTheDocument();
  });

  it("calls onSelect immediately when a modem card is tapped", async () => {
    const onSelect = vi.fn();
    render(
      <MultipleMatches modems={modems} onSelect={onSelect} onBack={() => {}} />
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Archer C7/i })
    );
    expect(onSelect).toHaveBeenCalledWith(modems[1]);
  });

  it("does not render a Continue button", () => {
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
    );
    expect(
      screen.queryByRole("button", { name: /continue/i })
    ).not.toBeInTheDocument();
  });

  it("calls onBack when bottom bar Back button is clicked", async () => {
    const onBack = vi.fn();
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={onBack} />
    );
    await userEvent.click(screen.getByRole("button", { name: /^back$/i }));
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

  it("renders the help link", () => {
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
    );
    expect(
      screen.getByText(/i can't find my modem/i)
    ).toBeInTheDocument();
  });

  it("renders all modem cards with brand names", () => {
    render(
      <MultipleMatches modems={modems} onSelect={() => {}} onBack={() => {}} />
    );
    const brandLabels = screen.getAllByText("TP-Link");
    expect(brandLabels).toHaveLength(modems.length);
  });
});
