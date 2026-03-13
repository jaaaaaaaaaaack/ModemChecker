import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseScreen } from "../../src/components/BaseScreen";

describe("BaseScreen", () => {
  it("renders modem selection heading", () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    expect(screen.getByText(/modem selection/i)).toBeInTheDocument();
  });

  it("does not show BYO section before selecting BYO", () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    expect(screen.queryByText(/check your modem/i)).not.toBeInTheDocument();
  });

  it("shows check your modem button when BYO selected", async () => {
    render(<BaseScreen onCheckModem={() => {}} />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    expect(screen.getByRole("button", { name: /check your modem/i })).toBeInTheDocument();
  });

  it("calls onCheckModem when check button clicked", async () => {
    const onCheck = vi.fn();
    render(<BaseScreen onCheckModem={onCheck} />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    await userEvent.click(screen.getByRole("button", { name: /check your modem/i }));
    expect(onCheck).toHaveBeenCalledOnce();
  });

  it("shows verified modem info when provided", async () => {
    render(<BaseScreen onCheckModem={() => {}} verifiedModem={{ brand: "TP-Link", model: "Archer VR1600v", status: "yes" }} />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    expect(screen.getByText("Archer VR1600v")).toBeInTheDocument();
    expect(screen.getByText(/compatible with belong nbn/i)).toBeInTheDocument();
  });
});
