import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchError } from "../../src/components/SearchError";

describe("SearchError", () => {
  const defaultProps = {
    query: "tp-link",
    onRetry: vi.fn(),
    onReset: vi.fn(),
  };

  it("renders error heading", () => {
    render(<SearchError {...defaultProps} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders error body text", () => {
    render(<SearchError {...defaultProps} />);
    expect(
      screen.getByText(/check your internet connection/i)
    ).toBeInTheDocument();
  });

  it("calls onRetry when Try again is clicked", async () => {
    const onRetry = vi.fn();
    render(<SearchError {...defaultProps} onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("calls onReset when Start a new search is clicked", async () => {
    const onReset = vi.fn();
    render(<SearchError {...defaultProps} onReset={onReset} />);
    await userEvent.click(
      screen.getByRole("button", { name: /start a new search/i })
    );
    expect(onReset).toHaveBeenCalledOnce();
  });
});
