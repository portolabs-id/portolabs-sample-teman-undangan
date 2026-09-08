import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Rsvp } from "@/components/templates/sections/Rsvp";

// TurnstileWidget is an async server component; stub it so it can render
// synchronously inside this client-side render() call.
vi.mock("@/components/turnstile-widget", () => ({
  TurnstileWidget: ({ action }: { action: string }) => (
    <div data-testid="turnstile-widget" data-action={action} />
  ),
}));

type Entry = { id: string; guestName: string; attendance: "yes" | "no" | "maybe"; message: string | null };

const entries: Entry[] = [
  { id: "r1", guestName: "Andi", attendance: "yes", message: "Selamat ya!" },
  { id: "r2", guestName: "Budi", attendance: "no", message: null },
  { id: "r3", guestName: "Citra", attendance: "maybe", message: "Semoga bisa datang" },
];

describe("Rsvp", () => {
  it("renders the form with the TurnstileWidget", () => {
    render(<Rsvp invitationId="inv-1" entries={[]} />);
    expect(screen.getByPlaceholderText("Nama")).toBeInTheDocument();
    expect(screen.getByTestId("turnstile-widget")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kirim" })).toBeInTheDocument();
  });

  it("renders one card per RSVP entry", () => {
    render(<Rsvp invitationId="inv-1" entries={entries} />);
    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Citra")).toBeInTheDocument();
  });

  it("labels a 'yes' attendance as Hadir", () => {
    render(<Rsvp invitationId="inv-1" entries={[entries[0]]} />);
    expect(screen.getByText(/· Hadir/)).toBeInTheDocument();
  });

  it("labels a 'no' attendance as Tidak hadir", () => {
    render(<Rsvp invitationId="inv-1" entries={[entries[1]]} />);
    expect(screen.getByText(/· Tidak hadir/)).toBeInTheDocument();
  });

  it("labels a 'maybe' attendance as Mungkin", () => {
    render(<Rsvp invitationId="inv-1" entries={[entries[2]]} />);
    expect(screen.getByText(/· Mungkin/)).toBeInTheDocument();
  });

  it("shows the message when one is present", () => {
    render(<Rsvp invitationId="inv-1" entries={[entries[0]]} />);
    expect(screen.getByText("Selamat ya!")).toBeInTheDocument();
  });

  it("omits the message paragraph when the message is null", () => {
    render(<Rsvp invitationId="inv-1" entries={[entries[1]]} />);
    expect(screen.queryByText("Selamat ya!")).not.toBeInTheDocument();
    expect(screen.queryByText("Semoga bisa datang")).not.toBeInTheDocument();
  });

  it("defaults the name field to the guest name when guest is provided", () => {
    render(<Rsvp invitationId="inv-1" guest="Dewi" entries={[]} />);
    const input = screen.getByPlaceholderText("Nama") as HTMLInputElement;
    expect(input.defaultValue).toBe("Dewi");
  });

  it("defaults the name field to an empty string when guest is absent", () => {
    render(<Rsvp invitationId="inv-1" entries={[]} />);
    const input = screen.getByPlaceholderText("Nama") as HTMLInputElement;
    expect(input.defaultValue).toBe("");
  });
});
