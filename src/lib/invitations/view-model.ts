import type { Invitation, Photo } from "@/lib/db/schema";

export type InvitationView = {
  slug: string;
  template: Invitation["template"];
  coupleTitle: string;
  groomName: string;
  groomParents: string;
  brideName: string;
  brideParents: string;
  akadAt: number | null;
  resepsiAt: number | null;
  venueName: string;
  venueAddress: string;
  mapsUrl: string | null;
  coverUrl: string | null;
  gallery: string[];
  hasGift: boolean;
  gift: { bankName: string | null; accountNumber: string | null; accountHolder: string | null };
};

export function mediaUrl(key: string): string {
  return `/api/media/${encodeURIComponent(key)}`;
}

export function toInvitationView(inv: Invitation, photos: Photo[]): InvitationView {
  return {
    slug: inv.slug,
    template: inv.template,
    coupleTitle: `${inv.groomName} & ${inv.brideName}`,
    groomName: inv.groomName,
    groomParents: inv.groomParents,
    brideName: inv.brideName,
    brideParents: inv.brideParents,
    akadAt: inv.akadAt,
    resepsiAt: inv.resepsiAt,
    venueName: inv.venueName,
    venueAddress: inv.venueAddress,
    mapsUrl: inv.mapsUrl,
    coverUrl: inv.coverPhotoKey ? mediaUrl(inv.coverPhotoKey) : null,
    gallery: [...photos].sort((a, b) => a.order - b.order).map((p) => mediaUrl(p.r2Key)),
    hasGift: Boolean(inv.giftAccountNumber),
    gift: { bankName: inv.giftBankName, accountNumber: inv.giftAccountNumber, accountHolder: inv.giftAccountHolder },
  };
}
