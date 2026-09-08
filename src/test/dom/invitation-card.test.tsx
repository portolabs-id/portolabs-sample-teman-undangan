import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { InvitationCard } from "@/components/dashboard/invitation-card";

vi.mock("@/app/(app)/dashboard/actions", () => ({
  setInvitationStatusAction: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

const draft = { id: "inv-1", slug: "budi-siti", coupleTitle: "Budi & Siti", status: "draft" as const };
const published = { ...draft, id: "inv-2", status: "published" as const };

describe("InvitationCard", () => {
  beforeEach(() => {
    vi.stubGlobal("location", { origin: "https://temanundangan.example" });
  });

  it("shows the Draf label and hides the copy-link button for a draft invitation", () => {
    render(<InvitationCard inv={draft} />);
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salin link" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Terbitkan" })).toBeInTheDocument();
  });

  it("shows the Terbit label and the copy-link button for a published invitation", () => {
    render(<InvitationCard inv={published} />);
    expect(screen.getByText("Terbit")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salin link" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Jadikan draf" })).toBeInTheDocument();
  });

  it("copies the invitation link and toasts success", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<InvitationCard inv={published} />);

    await user.click(screen.getByRole("button", { name: "Salin link" }));

    expect(writeText).toHaveBeenCalledWith("https://temanundangan.example/u/budi-siti");
    expect(toast.success).toHaveBeenCalledWith("Link disalin");
  });

  it("toasts a fallback message when the clipboard write is rejected", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    render(<InvitationCard inv={published} />);

    await user.click(screen.getByRole("button", { name: "Salin link" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Browser menolak menyalin. Buka undangan lalu salin dari address bar."
    );
  });
});
