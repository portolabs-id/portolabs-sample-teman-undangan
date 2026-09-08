import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/templates/sections/Hero";
import type { InvitationView } from "@/lib/invitations/view-model";

const baseView: InvitationView = {
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
  gallery: [],
  hasGift: false,
  gift: { bankName: null, accountNumber: null, accountHolder: null },
};

describe("Hero", () => {
  it("sets the background-image style when coverUrl is present", () => {
    const { container } = render(<Hero view={baseView} />);
    const section = container.querySelector("section");
    expect(section).toHaveStyle({ backgroundImage: "url(/api/media/cover.jpg)" });
  });

  it("leaves the background-image style unset when coverUrl is null", () => {
    const { container } = render(<Hero view={{ ...baseView, coverUrl: null }} />);
    const section = container.querySelector("section");
    expect(section?.style.backgroundImage).toBe("");
  });

  it("shows the guest name when guest is provided", () => {
    render(<Hero view={baseView} guest="Andi" />);
    expect(screen.getByText("Andi")).toBeInTheDocument();
    expect(screen.getByText(/Kepada Yth\./)).toBeInTheDocument();
  });

  it("does not render a guest line when guest is absent", () => {
    render(<Hero view={baseView} />);
    expect(screen.queryByText(/Kepada Yth\./)).not.toBeInTheDocument();
  });

  it("falls back to resepsiAt for the countdown target when akadAt is null", () => {
    render(<Hero view={{ ...baseView, akadAt: null }} />);
    // Countdown renders a "Hari" unit label, proving it mounted using resepsiAt.
    expect(screen.getByText("Hari")).toBeInTheDocument();
  });

  it("renders no countdown when both akadAt and resepsiAt are null", () => {
    render(<Hero view={{ ...baseView, akadAt: null, resepsiAt: null }} />);
    expect(screen.queryByText("Hari")).not.toBeInTheDocument();
  });
});
