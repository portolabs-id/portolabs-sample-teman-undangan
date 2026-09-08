import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassicTemplate } from "@/components/templates/classic";
import { FloralTemplate } from "@/components/templates/floral";
import { ModernTemplate } from "@/components/templates/modern";
import type { InvitationView } from "@/lib/invitations/view-model";

const view: InvitationView = {
  slug: "budi-siti-123456",
  template: "classic",
  coupleTitle: "Budi & Siti",
  groomName: "Budi",
  groomParents: "Pak A & Bu B",
  brideName: "Siti",
  brideParents: "Pak C & Bu D",
  akadAt: 1_800_000_000_000,
  resepsiAt: 1_800_010_000_000,
  venueName: "Gedung X",
  venueAddress: "Jl. Y",
  mapsUrl: "https://maps.google.com/x",
  coverUrl: "/api/media/cover.jpg",
  gallery: ["/api/media/g1.jpg"],
  hasGift: true,
  gift: { bankName: "BCA", accountNumber: "123", accountHolder: "Budi" },
};

const templates = [
  { name: "ClassicTemplate", Template: ClassicTemplate },
  { name: "FloralTemplate", Template: FloralTemplate },
  { name: "ModernTemplate", Template: ModernTemplate },
];

describe.each(templates)("$name", ({ Template }) => {
  it("renders all sections, the guest, and the rsvp slot when provided", () => {
    render(<>{Template({ view, guest: "Andi", rsvpSlot: <div data-testid="rsvp-slot">RSVP</div> })}</>);

    expect(screen.getByText("Budi & Siti")).toBeInTheDocument();
    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Siti")).toBeInTheDocument();
    expect(screen.getByText("Acara")).toBeInTheDocument();
    expect(screen.getByText("Lokasi")).toBeInTheDocument();
    expect(screen.getByText("Galeri")).toBeInTheDocument();
    expect(screen.getByText("Amplop Digital")).toBeInTheDocument();
    expect(screen.getByTestId("rsvp-slot")).toBeInTheDocument();
    expect(screen.getByText("Dibuat dengan Teman Undangan")).toBeInTheDocument();
  });

  it("renders without a guest or rsvp slot when both are omitted", () => {
    render(<>{Template({ view })}</>);

    expect(screen.queryByText("Andi")).not.toBeInTheDocument();
    expect(screen.queryByTestId("rsvp-slot")).not.toBeInTheDocument();
    expect(screen.getByText("Budi & Siti")).toBeInTheDocument();
  });
});
