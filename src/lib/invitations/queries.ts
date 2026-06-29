import { and, eq, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { invitations, photos, type Invitation } from "@/lib/db/schema";
import { generateSlug } from "./slug";
import type { InvitationInput } from "./schema";

function id(): string {
  return crypto.randomUUID();
}

export async function createInvitation(userId: string, input: InvitationInput): Promise<Invitation> {
  const db = await getDb();
  const now = Date.now();
  const row = {
    id: id(),
    userId,
    slug: generateSlug({ groomName: input.groomName, brideName: input.brideName }),
    ...input,
    status: "draft" as const,
    giftQrisKey: null,
    coverPhotoKey: null,
    createdAt: now,
    updatedAt: now,
  };
  await db.insert(invitations).values(row);
  return row as Invitation;
}

export async function listInvitations(userId: string): Promise<Invitation[]> {
  const db = await getDb();
  return db.select().from(invitations).where(eq(invitations.userId, userId)).orderBy(desc(invitations.updatedAt));
}

export async function getInvitationForOwner(userId: string, invId: string): Promise<Invitation | null> {
  const db = await getDb();
  const [row] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, invId), eq(invitations.userId, userId)));
  return row ?? null;
}

export async function updateInvitation(userId: string, invId: string, input: InvitationInput): Promise<void> {
  const db = await getDb();
  await db
    .update(invitations)
    .set({ ...input, updatedAt: Date.now() })
    .where(and(eq(invitations.id, invId), eq(invitations.userId, userId)));
}

export async function setStatus(userId: string, invId: string, status: "draft" | "published"): Promise<void> {
  const db = await getDb();
  await db
    .update(invitations)
    .set({ status, updatedAt: Date.now() })
    .where(and(eq(invitations.id, invId), eq(invitations.userId, userId)));
}

export async function getPublishedBySlug(slug: string): Promise<{ invitation: Invitation; photos: typeof photos.$inferSelect[] } | null> {
  const db = await getDb();
  const [inv] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.slug, slug), eq(invitations.status, "published")));
  if (!inv) return null;
  const pics = await db.select().from(photos).where(eq(photos.invitationId, inv.id));
  return { invitation: inv, photos: pics };
}
