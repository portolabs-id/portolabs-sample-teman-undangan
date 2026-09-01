import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { getInvitationForOwner } from "@/lib/invitations/queries";
import { getDb } from "@/lib/db";
import { photos as photosTable } from "@/lib/db/schema";
import { mediaUrl } from "@/lib/invitations/view-model";
import { BuilderWizard } from "./builder-wizard";

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

  const isPublished = inv.status === "published";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{inv.groomName} &amp; {inv.brideName}</h1>
          <p className={`status-pill ${isPublished ? "status-pill--live" : ""}`}>{isPublished ? "Terbit" : "Draf"}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPublished && (
            <Link href={`/u/${inv.slug}`} target="_blank" className="btn btn--soft">Lihat undangan</Link>
          )}
          <Link href={`/builder/${id}/rsvps`} className="btn btn--soft">RSVP</Link>
          <Link href="/dashboard" className="btn btn--soft">Kembali</Link>
        </div>
      </div>
      <BuilderWizard id={id} values={values} photos={galleryPics} />
    </>
  );
}
