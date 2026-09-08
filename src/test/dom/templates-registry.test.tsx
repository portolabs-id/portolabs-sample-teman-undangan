import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { pickTemplate, templateRegistry } from "@/components/templates/registry";
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

describe("pickTemplate", () => {
  it("returns the classic template for 'classic'", () => {
    expect(pickTemplate("classic")).toBe(templateRegistry.classic);
    expect(pickTemplate("classic")).toBe(ClassicTemplate);
  });

  it("returns the floral template for 'floral'", () => {
    expect(pickTemplate("floral")).toBe(FloralTemplate);
  });

  it("returns the modern template for 'modern'", () => {
    expect(pickTemplate("modern")).toBe(ModernTemplate);
  });

  it("falls back to the classic template for an unknown name", () => {
    expect(pickTemplate("does-not-exist")).toBe(ClassicTemplate);
  });

  it("renders the picked template with the given view", () => {
    const Template = pickTemplate("classic");
    render(<>{Template({ view })}</>);
    expect(screen.getByText("Budi & Siti")).toBeInTheDocument();
  });
});
