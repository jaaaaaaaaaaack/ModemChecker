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
    render(<ModemChecker techType="fttp" />);
    expect(screen.getByText(/modem selection/i)).toBeInTheDocument();
  });

  it("opens bottom sheet when check my modem is clicked", async () => {
    render(<ModemChecker techType="fttp" />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    await userEvent.click(
      screen.getByRole("button", { name: /check your modem/i })
    );
    expect(screen.getByText(/find your modem/i)).toBeInTheDocument();
  });

  it("shows loading state after search", async () => {
    mockSearch.mockImplementation(
      () => new Promise(() => {}) // never resolves — stays in searching state
    );
    render(<ModemChecker techType="fttp" />);
    await userEvent.click(screen.getByText(/no, i.ll use my own/i));
    await userEvent.click(
      screen.getByRole("button", { name: /check your modem/i })
    );

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "TP-Link");
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText(/finding your modem/i)).toBeInTheDocument();
  });

  it("shows error screen when search fails", async () => {
    mockSearch.mockRejectedValue(new Error("Network error"));
    render(<ModemChecker techType="fttp" />);

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
