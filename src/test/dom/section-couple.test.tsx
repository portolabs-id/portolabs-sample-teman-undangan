import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Couple } from "@/components/templates/sections/Couple";
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

describe("Couple", () => {
  it("renders both parents lines when parents strings are present", () => {
    render(<Couple view={baseView} />);
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Siti")).toBeInTheDocument();
    expect(screen.getByText(/Pak A & Bu B/)).toBeInTheDocument();
    expect(screen.getByText(/Pak C & Bu D/)).toBeInTheDocument();
  });

  it("omits the groom parents line when groomParents is empty", () => {
    render(<Couple view={{ ...baseView, groomParents: "" }} />);
    expect(screen.queryByText(/Pak A & Bu B/)).not.toBeInTheDocument();
    expect(screen.getByText(/Pak C & Bu D/)).toBeInTheDocument();
  });

  it("omits the bride parents line when brideParents is empty", () => {
    render(<Couple view={{ ...baseView, brideParents: "" }} />);
    expect(screen.getByText(/Pak A & Bu B/)).toBeInTheDocument();
    expect(screen.queryByText(/Pak C & Bu D/)).not.toBeInTheDocument();
  });
});
