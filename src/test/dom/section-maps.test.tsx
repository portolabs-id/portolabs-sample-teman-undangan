import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Maps } from "@/components/templates/sections/Maps";
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
  venueName: "",
  venueAddress: "",
  mapsUrl: null,
  coverUrl: null,
  gallery: [],
  hasGift: false,
  gift: { bankName: null, accountNumber: null, accountHolder: null },
};

describe("Maps", () => {
  it("renders a link to Google Maps when mapsUrl is a valid https URL", () => {
    render(<Maps view={{ ...baseView, mapsUrl: "https://maps.google.com/x" }} />);
    const link = screen.getByRole("link", { name: "Buka di Google Maps" });
    expect(link).toHaveAttribute("href", "https://maps.google.com/x");
  });

  it("renders nothing when mapsUrl is null", () => {
    const { container } = render(<Maps view={{ ...baseView, mapsUrl: null }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a javascript: URL, blocking it as an XSS sink", () => {
    const { container } = render(<Maps view={{ ...baseView, mapsUrl: "javascript:alert(1)" }} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
