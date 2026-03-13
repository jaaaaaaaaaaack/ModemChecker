import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckerCard } from "../../src/ui/components/CheckerCard";

describe("CheckerCard", () => {
  it("renders compatible status with green checkmark row", () => {
    render(
      <CheckerCard
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
      <CheckerCard
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
      <CheckerCard
        modemName="Slow WiFi Router"
        status="speed-warning"
        speedWarningType="wifi-bottleneck"
      />
    );
    expect(
      screen.getByText(/may not be capable of supporting.*over Wi-Fi/i)
    ).toBeInTheDocument();
  });

  it("absorbs setup conditions into generic callout without individual items", () => {
    render(
      <CheckerCard
        modemName="Needs Setup Router"
        status="callout"
        conditions={["SWITCH_TO_IPOE", "DISABLE_VLAN"]}
      />
    );
    expect(screen.getByText("Some setup required")).toBeInTheDocument();
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
    expect(screen.queryByText("Disable VLAN tagging")).not.toBeInTheDocument();
  });

  it("renders no callout rows when conditions is empty", () => {
    render(
      <CheckerCard
        modemName="Clean Router"
        status="compatible"
        conditions={[]}
      />
    );
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });

  it("renders callout status with setup summary but no individual setup items", () => {
    render(
      <CheckerCard
        modemName="Setup Router"
        status="callout"
        conditions={["SWITCH_TO_IPOE"]}
      />
    );
    expect(screen.getByText("Some setup required")).toBeInTheDocument();
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });

  it("renders ISP_LOCK as individual item alongside generic callout", () => {
    render(
      <CheckerCard
        modemName="Locked Router"
        status="callout"
        conditions={["SWITCH_TO_IPOE", "ISP_LOCK"]}
      />
    );
    expect(screen.getByText("Some setup required")).toBeInTheDocument();
    expect(screen.getByText("May be ISP-locked")).toBeInTheDocument();
    expect(screen.queryByText("Reconfigure to IPoE")).not.toBeInTheDocument();
  });
});
