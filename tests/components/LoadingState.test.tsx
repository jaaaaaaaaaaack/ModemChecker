import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "../../src/components/LoadingState";

describe("LoadingState", () => {
  it("renders loading text", () => {
    render(<LoadingState />);
    expect(screen.getByText(/finding your modem/i)).toBeInTheDocument();
  });

  it("has a spinner with accessible role", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
