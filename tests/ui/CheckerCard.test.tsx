import { describe, it, expect, vi } from "vitest";
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

  it("renders FTTN-specific description when not-compatible and techType is fttn", () => {
    render(
      <CheckerCard.ResultsCard
        status="not-compatible"
        modemName="Eero 6+"
        brand="Amazon"
        techType="fttn"
      />
    );
    expect(
      screen.getByText(/won\u2019t work with your home\u2019s nbn connection type/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/use a different compatible modem/i)
    ).toBeInTheDocument();
  });

  it("renders default not-compatible description when techType is not fttn", () => {
    render(
      <CheckerCard.ResultsCard
        status="not-compatible"
        modemName="Some Modem"
        brand="Acme"
        techType="fttp"
      />
    );
    expect(
      screen.queryByText(/won\u2019t work with your home\u2019s nbn connection type/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/purchase a different compatible modem/i)
    ).toBeInTheDocument();
  });

  it("renders 'add a Belong modem' as a clickable link in FTTN not-compatible", () => {
    const onAddBelongModem = vi.fn();
    render(
      <CheckerCard.ResultsCard
        status="not-compatible"
        modemName="Eero 6+"
        brand="Amazon"
        techType="fttn"
        onAddBelongModem={onAddBelongModem}
      />
    );
    const link = screen.getByRole("button", { name: /add a belong modem/i });
    expect(link).toBeInTheDocument();
  });

  it("renders updated FAQ link text for FTTN not-compatible", () => {
    render(
      <CheckerCard.ResultsCard
        status="not-compatible"
        modemName="Eero 6+"
        brand="Amazon"
        techType="fttn"
      />
    );
    expect(
      screen.getByText(/see our faqs for more info/i)
    ).toBeInTheDocument();
  });
});
