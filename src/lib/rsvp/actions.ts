"use server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/lib/db";
import { rsvps, invitations } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { RSVP_TURNSTILE_ACTION } from "@/lib/turnstile/actions";
import { rsvpInput } from "./schema";

async function guardRsvpRequest(invitationId: string, formData: FormData) {
  const requestHeaders = await headers();
  const clientIp = requestHeaders.get("cf-connecting-ip");
  const { env } = await getCloudflareContext({ async: true });

  const { success } = await env.RSVP_RATE_LIMITER.limit({ key: `${invitationId}:${clientIp ?? "unknown"}` });
  if (!success) throw new Error("Terlalu banyak kiriman. Coba lagi sebentar lagi.");

  const verified = await verifyTurnstileToken({
    token: formData.get("cf-turnstile-response")?.toString(),
    action: RSVP_TURNSTILE_ACTION,
    remoteIp: clientIp,
  });
  if (!verified) throw new Error("Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.");
}

export async function submitRsvpAction(invitationId: string, formData: FormData) {
  await guardRsvpRequest(invitationId, formData);

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
