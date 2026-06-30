"use client";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { togglePublishAction } from "@/app/(app)/dashboard/actions";

export function InvitationCard({ inv }: { inv: { id: string; slug: string; coupleTitle: string; status: "draft" | "published" } }) {
  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/u/${inv.slug}`;
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="font-semibold">{inv.coupleTitle}</div>
      <div className="text-sm text-muted-foreground">Status: {inv.status === "published" ? "Terbit" : "Draf"}</div>
      <div className="flex flex-wrap gap-2">
        <Link href={`/builder/${inv.id}`} className={buttonVariants({ size: "sm" })}>Edit</Link>
        <Link href={`/builder/${inv.id}/rsvps`} className={buttonVariants({ size: "sm", variant: "secondary" })}>RSVP</Link>
        {inv.status === "published" && (
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link disalin"); }}>
            Salin link
          </Button>
        )}
        <form action={togglePublishAction.bind(null, inv.id, inv.status === "published" ? "draft" : "published")}>
          <Button size="sm" variant={inv.status === "published" ? "ghost" : "default"}>
            {inv.status === "published" ? "Jadikan draf" : "Terbitkan"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
