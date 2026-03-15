import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModemInfoSheet } from "../../src/components/ModemInfoSheet";

describe("ModemInfoSheet", () => {
  it("renders the modem heading and intro", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("Belong Wi-Fi 6 Modem")).toBeInTheDocument();
    expect(screen.getByText(/fast, reliable and simple modem/i)).toBeInTheDocument();
  });

  it("renders all five feature sections", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("Speed and reliability")).toBeInTheDocument();
    expect(screen.getByText("Connect the whole house")).toBeInTheDocument();
    expect(screen.getByText("Super easy setup")).toBeInTheDocument();
    expect(screen.getByText("Safety and security")).toBeInTheDocument();
    expect(screen.getByText("Great support")).toBeInTheDocument();
  });

  it("renders the external link to belong.com.au", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText(/View full details on our Modem FAQs page/i)).toBeInTheDocument();
  });

  it("calls onClose when Close button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModemInfoSheet onClose={onClose} />);
    const buttons = screen.getAllByRole("button", { name: /close/i });
    await user.click(buttons[buttons.length - 1]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when header close (X) button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModemInfoSheet onClose={onClose} />);
    await user.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
