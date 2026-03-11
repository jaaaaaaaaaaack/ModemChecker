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
});
