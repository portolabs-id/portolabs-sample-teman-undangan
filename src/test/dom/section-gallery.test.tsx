import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Gallery } from "@/components/templates/sections/Gallery";
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

describe("Gallery", () => {
  it("renders nothing when the gallery is empty", () => {
    const { container } = render(<Gallery view={baseView} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one image per gallery entry", () => {
    const gallery = ["/api/media/g1.jpg", "/api/media/g2.jpg", "/api/media/g3.jpg"];
    const { container } = render(<Gallery view={{ ...baseView, gallery }} />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(3);
    expect(Array.from(images).map((img) => img.getAttribute("src"))).toEqual(gallery);
  });
});
