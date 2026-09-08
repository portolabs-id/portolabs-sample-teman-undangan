import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Envelope } from "@/components/templates/sections/Envelope";
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

describe("Envelope", () => {
  it("renders nothing when hasGift is false", () => {
    const { container } = render(<Envelope view={baseView} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the bank name, account number, and holder when hasGift is true", () => {
    render(
      <Envelope
        view={{
          ...baseView,
          hasGift: true,
          gift: { bankName: "BCA", accountNumber: "1234567890", accountHolder: "Budi Santoso" },
        }}
      />,
    );
    expect(screen.getByText("BCA")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("a.n. Budi Santoso")).toBeInTheDocument();
  });
});
