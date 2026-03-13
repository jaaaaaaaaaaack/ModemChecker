import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomSheet } from "../../src/components/BottomSheet";

describe("BottomSheet", () => {
  it("does not render when initially closed", () => {
    render(
      <BottomSheet open={false} onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.queryByText("Sheet content")).not.toBeInTheDocument();
  });

  it("renders children when open", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Sheet content</p>
      </BottomSheet>
    );
    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });

  it("has dialog role and aria-modal", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Content</p>
      </BottomSheet>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("has an accessible title (sr-only)", () => {
    render(
      <BottomSheet open onClose={() => {}}>
        <p>Content</p>
      </BottomSheet>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when overlay is clicked", async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet open onClose={onClose}>
        <p>Content</p>
      </BottomSheet>
    );
    await userEvent.click(screen.getByTestId("sheet-overlay"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
