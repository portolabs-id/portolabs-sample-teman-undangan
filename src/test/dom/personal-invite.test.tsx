import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { PersonalInvite } from "@/components/landing/personal-invite";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

function stubClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

describe("PersonalInvite", () => {
  it("greets with the fallback and omits ?to= when no guest is typed", () => {
    render(<PersonalInvite />);
    expect(screen.getByText("Bapak/Ibu/Saudara/i")).toBeInTheDocument();
    expect(screen.getByText("temanundangan.portolabs.id/u/dinda-rafi")).toBeInTheDocument();
  });

  it("updates the greeting and the ?to= link with an encoded guest name", async () => {
    const user = userEvent.setup();
    render(<PersonalInvite />);
    await user.type(screen.getByLabelText("Tulis nama tamu"), "Budi & Siti");

    expect(screen.getByText("Budi & Siti")).toBeInTheDocument();
    expect(
      screen.getByText("temanundangan.portolabs.id/u/dinda-rafi?to=Budi%20%26%20Siti")
    ).toBeInTheDocument();
  });

  it("truncates the guest name input to 40 characters", async () => {
    const user = userEvent.setup();
    render(<PersonalInvite />);
    const longName = "A".repeat(50);
    const input = screen.getByLabelText("Tulis nama tamu") as HTMLInputElement;
    await user.type(input, longName);

    expect(input.value).toHaveLength(40);
    expect(input.value).toBe("A".repeat(40));
  });

  it("copies the https link and toasts success", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<PersonalInvite />);

    await user.click(screen.getByRole("button", { name: "Salin link" }));

    expect(writeText).toHaveBeenCalledWith("https://temanundangan.portolabs.id/u/dinda-rafi");
    expect(toast.success).toHaveBeenCalledWith("Link disalin");
  });

  it("toasts a fallback message when the clipboard write is rejected", async () => {
    const user = userEvent.setup();
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(<PersonalInvite />);

    await user.click(screen.getByRole("button", { name: "Salin link" }));

    expect(toast.error).toHaveBeenCalledWith("Browser menolak menyalin. Salin manual dari kolom link.");
  });
});
