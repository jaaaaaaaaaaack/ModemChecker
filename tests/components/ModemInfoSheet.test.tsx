import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModemInfoSheet } from "../../src/components/ModemInfoSheet";

describe("ModemInfoSheet", () => {
  it("renders the modem heading and intro", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("Belong Wi-Fi Modem")).toBeInTheDocument();
    expect(screen.getByText(/get the most out of your plan/i)).toBeInTheDocument();
  });

  it("renders all three feature sections", () => {
    render(<ModemInfoSheet onClose={() => {}} />);
    expect(screen.getByText("Fast and reliable")).toBeInTheDocument();
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
