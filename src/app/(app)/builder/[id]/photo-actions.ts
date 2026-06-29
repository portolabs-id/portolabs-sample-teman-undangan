"use server";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { requireUser } from "@/lib/auth/server";
import { getInvitationForOwner } from "@/lib/invitations/queries";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { extFromType, mediaKey, putPhoto, deletePhoto } from "@/lib/storage/r2";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_PHOTOS = 12;

export async function uploadPhotoAction(id: string, formData: FormData) {
  const user = await requireUser();
  const inv = await getInvitationForOwner(user.id, id);
  if (!inv) notFound();

  const file = formData.get("photo");
  if (!(file instanceof File)) throw new Error("No file");
  const ext = extFromType(file.type);
  if (!ext) throw new Error("Tipe file tidak didukung");
  if (file.size > MAX_BYTES) throw new Error("File terlalu besar (maks 5MB)");

  const db = await getDb();
  const existing = await db.select().from(photos).where(eq(photos.invitationId, id));
  if (existing.length >= MAX_PHOTOS) throw new Error("Maksimal 12 foto");

  const key = mediaKey(id, ext);
  await putPhoto(key, await file.arrayBuffer(), file.type);
  try {
    await db.insert(photos).values({
      id: crypto.randomUUID(),
      invitationId: id,
      r2Key: key,
      order: existing.length,
      createdAt: Date.now(),
    });
  } catch (err) {
    // Roll back the R2 write so a failed insert doesn't orphan the object.
    await deletePhoto(key).catch(() => {});
    throw err;
  }
  revalidatePath(`/builder/${id}`);
}

export async function deletePhotoAction(id: string, photoId: string) {
  const user = await requireUser();
  const inv = await getInvitationForOwner(user.id, id);
  if (!inv) notFound();

  const db = await getDb();
  const [row] = await db.select().from(photos).where(and(eq(photos.id, photoId), eq(photos.invitationId, id)));
  if (!row) return;
  await deletePhoto(row.r2Key);
  await db.delete(photos).where(eq(photos.id, photoId));
  revalidatePath(`/builder/${id}`);
}
