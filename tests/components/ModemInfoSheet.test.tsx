import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModemInfoSheet } from "../../src/components/ModemInfoSheet";

describe("ModemInfoSheet", () => {
  it("renders the modem heading and intro", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("Belong Wi-Fi 6 Modem")).toBeInTheDocument();
    expect(screen.getByText(/fast and reliable modem/i)).toBeInTheDocument();
  });

  it("renders all four feature sections", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("The speed your home needs")).toBeInTheDocument();
    expect(screen.getByText("Connect the whole house")).toBeInTheDocument();
    expect(screen.getByText("Support and warranty")).toBeInTheDocument();
    expect(screen.getByText("Safe and secure")).toBeInTheDocument();
  });

  it("renders the external link to belong.com.au", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText(/View full details on belong.com.au/i)).toBeInTheDocument();
  });

  it("calls onClose when Close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModemInfoSheet onClose={onClose} />);
    const buttons = screen.getAllByRole("button", { name: /close/i });
    await user.click(buttons[buttons.length - 1]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when dismiss (X) button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModemInfoSheet onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /dismiss/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
