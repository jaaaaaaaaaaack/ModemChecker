import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModemChecker } from "../../src/components/ModemChecker";

vi.mock("../../src/lib/search", () => ({
  searchModems: vi.fn(),
}));

import { searchModems } from "../../src/lib/search";
const mockSearch = vi.mocked(searchModems);

describe("ModemChecker", () => {
  it("renders base screen with modem selection", () => {
    render(<ModemChecker />);
    expect(screen.getByText(/modem selection/i)).toBeInTheDocument();
  });

  it("opens bottom sheet when check my modem is clicked", async () => {
    render(<ModemChecker />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    await userEvent.click(
      screen.getByRole("button", { name: /check your modem/i })
    );
    expect(screen.getByText(/search for your modem/i)).toBeInTheDocument();
  });

  it("shows loading state after search", async () => {
    mockSearch.mockImplementation(
      () => new Promise(() => {}) // never resolves — stays in searching state
    );
    render(<ModemChecker />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    await userEvent.click(
      screen.getByRole("button", { name: /check your modem/i })
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "TP-Link");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText(/finding your modem/i)).toBeInTheDocument();
  });

  it("opens modem info sheet when Learn more is clicked", async () => {
    const user = userEvent.setup();
    render(<ModemChecker />);
    await user.click(screen.getByText("Learn more"));
    expect(screen.getByText("Belong Wi-Fi Modem")).toBeInTheDocument();
  });

  it("shows error screen when search fails", async () => {
    mockSearch.mockRejectedValue(new Error("Network error"));
    render(<ModemChecker />);

    // Open sheet
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    await userEvent.click(
      screen.getByRole("button", { name: /check your modem/i })
    );

    // Submit search
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "TP-Link");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    // Should show error screen, not "No modem found"
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByText(/no modem found/i)).not.toBeInTheDocument();
  });
});
