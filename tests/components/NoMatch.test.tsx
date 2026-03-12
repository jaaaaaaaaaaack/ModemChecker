import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoMatch } from "../../src/components/NoMatch";

describe("NoMatch", () => {
  it("renders no match heading", () => {
    render(<NoMatch onRetry={() => {}} />);
    expect(screen.getByText(/no modem found/i)).toBeInTheDocument();
  });

  it("calls onRetry when try again button clicked", async () => {
    const onRetry = vi.fn();
    render(<NoMatch onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try a new search/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows the searched query when provided", () => {
    render(<NoMatch onRetry={() => {}} query="Eero 8" />);
    expect(screen.getByText(/eero 8/i)).toBeInTheDocument();
  });
});
