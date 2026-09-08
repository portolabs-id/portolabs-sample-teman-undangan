import { describe, it, expect } from "vitest";
import { toInvitationView, mediaUrl } from "@/lib/invitations/view-model";
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

  it("leaves coverUrl null when there is no cover photo key", () => {
    const v = toInvitationView({ ...base, coverPhotoKey: null }, []);
    expect(v.coverUrl).toBeNull();
  });

  it("sorts the gallery by photo order regardless of input order", () => {
    const photos: Photo[] = [
      { id: "p2", invitationId: "i1", r2Key: "second.jpg", order: 2, createdAt: 0 },
      { id: "p1", invitationId: "i1", r2Key: "first.jpg", order: 1, createdAt: 0 },
      { id: "p3", invitationId: "i1", r2Key: "third.jpg", order: 3, createdAt: 0 },
    ];
    const v = toInvitationView(base, photos);
    expect(v.gallery).toEqual(["/api/media/first.jpg", "/api/media/second.jpg", "/api/media/third.jpg"]);
  });
});

describe("mediaUrl", () => {
  it("percent-encodes a key containing a slash", () => {
    expect(mediaUrl("folder/photo.jpg")).toBe("/api/media/folder%2Fphoto.jpg");
  });
});
