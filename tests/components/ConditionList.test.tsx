import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConditionList } from "../../src/components/ConditionList";

describe("ConditionList", () => {
  it("renders labels for each condition code", () => {
    render(<ConditionList conditions={["SWITCH_TO_IPOE", "WAN_PORT_LIMIT"]} />);
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
    expect(screen.getByText("WAN port speed bottleneck")).toBeInTheDocument();
  });

  it("renders nothing when conditions is empty", () => {
    const { container } = render(<ConditionList conditions={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders StatusIte with option-1 status when variant is callout", () => {
    const { container } = render(
      <ConditionList conditions={["SWITCH_TO_IPOE"]} variant="callout" />
    );
    // StatusIte status="option-1" → IconWithBackground variant="brand" (default)
    // which uses bg-brand-100 background. The "warning" variant would use bg-warning-100.
    expect(container.querySelector('[class*="bg-warning-100"]')).not.toBeInTheDocument();
    // And verify the label still renders
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
  });

  it("renders StatusIte with warning status by default", () => {
    const { container } = render(
      <ConditionList conditions={["SWITCH_TO_IPOE"]} />
    );
    // Default variant="warning" → StatusIte status="warning" → IconWithBackground variant="warning"
    // which applies bg-warning-100
    expect(container.querySelector('[class*="bg-warning-100"]')).toBeInTheDocument();
  });
});
