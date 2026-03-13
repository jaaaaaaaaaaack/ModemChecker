import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompatibilityCard } from "../../src/ui/components/CompatibilityCard";

describe("CompatibilityCard", () => {
  it("renders compatible status with green checkmark row", () => {
    render(
      <CompatibilityCard
        modemName="Archer VR1600v"
        brand="TP-Link"
        status="compatible"
      />
    );
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText("TP-Link")).toBeInTheDocument();
    expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
    // Speed row + hidden callout placeholder both contain this text
    expect(screen.getAllByText("Fast enough for your selected plan").length).toBeGreaterThanOrEqual(1);
  });

  it("renders speed warning with correct copy for wan-bottleneck", () => {
    render(
      <CompatibilityCard
        modemName="Old Router"
        status="speed-warning"
        speedWarningType="wan-bottleneck"
      />
    );
    expect(
      screen.getByText(/not fast enough to support your plan/i)
    ).toBeInTheDocument();
  });

  it("renders speed warning with correct copy for wifi-bottleneck", () => {
    render(
      <CompatibilityCard
        modemName="Slow WiFi Router"
        status="speed-warning"
        speedWarningType="wifi-bottleneck"
      />
    );
    expect(
      screen.getByText(/may not be capable of supporting.*over Wi-Fi/i)
    ).toBeInTheDocument();
  });

  it("renders individual callout items for each setup condition", () => {
    render(
      <CompatibilityCard
        modemName="Needs Setup Router"
        status="compatible"
        conditions={["SWITCH_TO_IPOE", "DISABLE_VLAN"]}
      />
    );
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
    expect(screen.getByText("Disable VLAN tagging")).toBeInTheDocument();
  });

  it("renders no callout rows when conditions is empty", () => {
    render(
      <CompatibilityCard
        modemName="Clean Router"
        status="compatible"
        conditions={[]}
      />
    );
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });

  it("renders callout status with setup summary", () => {
    render(
      <CompatibilityCard
        modemName="Setup Router"
        status="callout"
        conditions={["SWITCH_TO_IPOE"]}
      />
    );
    expect(screen.getByText("Some setup may be required")).toBeInTheDocument();
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
  });
});
