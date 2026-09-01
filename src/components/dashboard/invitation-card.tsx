"use client";
import Link from "next/link";
import { toast } from "sonner";
import { togglePublishAction } from "@/app/(app)/dashboard/actions";

type Invitation = { id: string; slug: string; coupleTitle: string; status: "draft" | "published" };

export function InvitationCard({ inv }: { inv: Invitation }) {
  const isPublished = inv.status === "published";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/u/${inv.slug}`);
      toast.success("Link disalin");
    } catch {
      toast.error("Browser menolak menyalin. Buka undangan lalu salin dari address bar.");
    }
  }

  return (
    <article className="inv-card">
      <h2 className="inv-card__title">{inv.coupleTitle}</h2>
      <p className={`status-pill ${isPublished ? "status-pill--live" : ""}`}>
        {isPublished ? "Terbit" : "Draf"}
      </p>
      <p className="inv-card__slug">/u/{inv.slug}</p>
      <div className="inv-card__actions">
        <Link href={`/builder/${inv.id}`} className="btn btn--soft">Edit</Link>
        <Link href={`/builder/${inv.id}/rsvps`} className="btn btn--soft">RSVP</Link>
        {isPublished && (
          <button type="button" onClick={copyLink} className="btn btn--soft">Salin link</button>
        )}
        <form action={togglePublishAction.bind(null, inv.id, isPublished ? "draft" : "published")}>
          <button type="submit" className={isPublished ? "btn btn--outline" : "btn btn--solid"}>
            {isPublished ? "Jadikan draf" : "Terbitkan"}
          </button>
        </form>
      </div>
    </article>
  );
}
