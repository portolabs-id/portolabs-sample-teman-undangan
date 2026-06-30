"use server";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { rsvps, invitations } from "@/lib/db/schema";
import { rsvpInput } from "./schema";

export async function submitRsvpAction(invitationId: string, formData: FormData) {
  const parsed = rsvpInput.parse({
    guestName: formData.get("guestName"),
    attendance: formData.get("attendance"),
    headcount: formData.get("headcount") ?? 1,
    message: formData.get("message") || undefined,
  });

  const db = await getDb();
  // Only accept RSVP for a published invitation.
  const [inv] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.status, "published")));
  if (!inv) throw new Error("Undangan tidak tersedia");

  await db.insert(rsvps).values({
    id: crypto.randomUUID(),
    invitationId,
    guestName: parsed.guestName,
    attendance: parsed.attendance,
    headcount: parsed.headcount,
    message: parsed.message ?? null,
    createdAt: Date.now(),
  });
  revalidatePath(`/u/${inv.slug}`);
}

export async function listRsvps(userId: string, invitationId: string) {
  const db = await getDb();
  const [inv] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, invitationId), eq(invitations.userId, userId)));
  if (!inv) return [];
  return db.select().from(rsvps).where(eq(rsvps.invitationId, invitationId)).orderBy(desc(rsvps.createdAt));
}
