import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "../../src/components/SearchInput";

describe("SearchInput", () => {
  it("renders heading and input field", () => {
    render(<SearchInput onSearch={() => {}} />);
    expect(screen.getByText(/find your modem/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onSearch with input value on submit", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    await userEvent.type(screen.getByRole("textbox"), "TP-Link Archer");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(onSearch).toHaveBeenCalledWith("TP-Link Archer");
  });

  it("does not submit when input is empty", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    await userEvent.click(screen.getByRole("button", { name: /continue/i }));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("submits on Enter key", async () => {
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} />);

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "Netgear{Enter}");

    expect(onSearch).toHaveBeenCalledWith("Netgear");
  });

  it("calls onClose when close button clicked", async () => {
    const onClose = vi.fn();
    render(<SearchInput onSearch={() => {}} onClose={onClose} />);
    await userEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not render close button when onClose is omitted", () => {
    render(<SearchInput onSearch={() => {}} />);
    expect(screen.queryByLabelText("Close")).not.toBeInTheDocument();
  });
});
