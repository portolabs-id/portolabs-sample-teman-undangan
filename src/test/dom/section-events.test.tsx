import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Events } from "@/components/templates/sections/Events";
import { googleCalendarUrl } from "@/lib/dates";
import type { InvitationView } from "@/lib/invitations/view-model";

const baseView: InvitationView = {
  slug: "budi-siti-123456",
  template: "classic",
  coupleTitle: "Budi & Siti",
  groomName: "Budi",
  groomParents: "Pak A & Bu B",
  brideName: "Siti",
  brideParents: "Pak C & Bu D",
  akadAt: null,
  resepsiAt: null,
  venueName: "Gedung X",
  venueAddress: "Jl. Y",
  mapsUrl: null,
  coverUrl: null,
  gallery: [],
  hasGift: false,
  gift: { bankName: null, accountNumber: null, accountHolder: null },
};

const akadAt = 1_800_000_000_000;
const resepsiAt = 1_800_010_000_000;

describe("Events", () => {
  it("renders nothing when neither akadAt nor resepsiAt is set", () => {
    const { container } = render(<Events view={baseView} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders only Akad Nikah when only akadAt is set", () => {
    render(<Events view={{ ...baseView, akadAt }} />);
    expect(screen.getByText("Akad Nikah")).toBeInTheDocument();
    expect(screen.queryByText("Resepsi")).not.toBeInTheDocument();
  });

  it("renders only Resepsi when only resepsiAt is set", () => {
    render(<Events view={{ ...baseView, resepsiAt }} />);
    expect(screen.queryByText("Akad Nikah")).not.toBeInTheDocument();
    expect(screen.getByText("Resepsi")).toBeInTheDocument();
  });

  it("renders both events when both dates are set", () => {
    render(<Events view={{ ...baseView, akadAt, resepsiAt }} />);
    expect(screen.getByText("Akad Nikah")).toBeInTheDocument();
    expect(screen.getByText("Resepsi")).toBeInTheDocument();
  });

  it("shows venueName and venueAddress when present", () => {
    render(<Events view={{ ...baseView, akadAt }} />);
    expect(screen.getByText("Gedung X")).toBeInTheDocument();
    expect(screen.getByText("Jl. Y")).toBeInTheDocument();
  });

  it("omits venueName and venueAddress lines when both are empty", () => {
    render(<Events view={{ ...baseView, akadAt, venueName: "", venueAddress: "" }} />);
    expect(screen.queryByText("Gedung X")).not.toBeInTheDocument();
    expect(screen.queryByText("Jl. Y")).not.toBeInTheDocument();
  });

  it("links to a Google Calendar event with the expected href", () => {
    render(<Events view={{ ...baseView, akadAt }} />);
    const expectedHref = googleCalendarUrl({
      title: `Akad Nikah ${baseView.coupleTitle}`,
      startMs: akadAt,
      endMs: akadAt + 2 * 3600_000,
      details: baseView.coupleTitle,
      location: baseView.venueAddress,
    });
    const link = screen.getByRole("link", { name: "+ Simpan ke Kalender" });
    expect(link).toHaveAttribute("href", expectedHref);
    expect(link).toHaveAttribute("target", "_blank");
  });
});
