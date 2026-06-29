import { describe, it, expect } from "vitest";
import { toInvitationView } from "@/lib/invitations/view-model";
import type { Invitation, Photo } from "@/lib/db/schema";

const base: Invitation = {
  id: "i1", userId: "u1", slug: "a-b-123456", template: "classic",
  groomName: "Budi", groomParents: "Pak A & Bu B", brideName: "Siti", brideParents: "Pak C & Bu D",
  akadAt: 1000, resepsiAt: 2000, venueName: "Gedung X", venueAddress: "Jl. Y",
  mapsUrl: "https://maps.google.com/x", giftBankName: "BCA", giftAccountNumber: "123",
  giftAccountHolder: "Budi", giftQrisKey: null, coverPhotoKey: "cover.jpg",
  status: "published", createdAt: 0, updatedAt: 0,
};

describe("toInvitationView", () => {
  it("maps photo keys to media URLs and exposes a couple title", () => {
    const photos: Photo[] = [{ id: "p1", invitationId: "i1", r2Key: "g1.jpg", order: 0, createdAt: 0 }];
    const v = toInvitationView(base, photos);
    expect(v.coupleTitle).toBe("Budi & Siti");
    expect(v.gallery[0]).toBe("/api/media/g1.jpg");
    expect(v.coverUrl).toBe("/api/media/cover.jpg");
    expect(v.hasGift).toBe(true);
  });
  it("flags missing gift info", () => {
    const v = toInvitationView({ ...base, giftAccountNumber: null }, []);
    expect(v.hasGift).toBe(false);
  });
});
