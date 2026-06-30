import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { getInvitationForOwner } from "@/lib/invitations/queries";
import { getDb } from "@/lib/db";
import { photos as photosTable } from "@/lib/db/schema";
import { mediaUrl } from "@/lib/invitations/view-model";
import { BuilderForm } from "./builder-form";
import { GalleryManager } from "./gallery-manager";

export default async function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const inv = await getInvitationForOwner(user.id, id);
  if (!inv) notFound();

  const db = await getDb();
  const pics = await db.select().from(photosTable).where(eq(photosTable.invitationId, id));
  const galleryPics = pics.sort((a, b) => a.order - b.order).map((p) => ({ id: p.id, url: mediaUrl(p.r2Key) }));

  const values: Record<string, string> = {
    template: inv.template,
    groomName: inv.groomName, brideName: inv.brideName,
    groomParents: inv.groomParents, brideParents: inv.brideParents,
    akadAt: inv.akadAt ? String(inv.akadAt) : "", resepsiAt: inv.resepsiAt ? String(inv.resepsiAt) : "",
    venueName: inv.venueName, venueAddress: inv.venueAddress, mapsUrl: inv.mapsUrl ?? "",
    giftBankName: inv.giftBankName ?? "", giftAccountNumber: inv.giftAccountNumber ?? "", giftAccountHolder: inv.giftAccountHolder ?? "",
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Undangan</h1>
        <div className="flex gap-2 text-sm">
          {inv.status === "published" && <Link className="underline" href={`/u/${inv.slug}`} target="_blank">Lihat</Link>}
          <Link className="underline" href="/dashboard">Kembali</Link>
        </div>
      </div>
      <BuilderForm id={id} values={values} />
      <GalleryManager id={id} photos={galleryPics} />
    </div>
  );
}
