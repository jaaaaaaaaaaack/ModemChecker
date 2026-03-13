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

  it("renders StatusItem with callout status when variant is callout", () => {
    const { container } = render(
      <ConditionList conditions={["SWITCH_TO_IPOE"]} variant="callout" />
    );
    // StatusItem status="callout" → IconWithBackground variant="dark-brand"
    // which uses bg-brand-800 background (not bg-neutral-200).
    expect(container.querySelector('[class*="bg-neutral-200"]')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="bg-brand-800"]')).toBeInTheDocument();
    expect(screen.getByText("Reconfigure to IPoE")).toBeInTheDocument();
  });

  it("renders StatusItem with warning status by default", () => {
    const { container } = render(
      <ConditionList conditions={["SWITCH_TO_IPOE"]} />
    );
    // Default variant="warning" → StatusItem status="warning" → IconWithBackground variant="neutral"
    // which applies bg-neutral-200
    expect(container.querySelector('[class*="bg-neutral-200"]')).toBeInTheDocument();
  });
});
