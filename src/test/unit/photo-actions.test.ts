import { afterEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { deletePhotoAction, uploadPhotoAction } from "@/app/(app)/builder/[id]/photo-actions";
import { createInvitation } from "@/lib/invitations/queries";
import { invitationInput } from "@/lib/invitations/schema";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { setTestEnv, attachTestBucket, attachTestDatabase } from "../support/env";
import { getRevalidatedPaths, NotFoundError } from "../support/next";

const user = { id: "u1", email: "u1@example.com" };

vi.mock("@/lib/auth/server", () => ({
  requireUser: async () => user,
}));

const baseInput = invitationInput.parse({ groomName: "Budi", brideName: "Siti" });

function jpegFile(size = 1024): File {
  return new File([new Uint8Array(size)], "photo.jpg", { type: "image/jpeg" });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("uploadPhotoAction", () => {
  it("throws NotFoundError for an unknown invitation", async () => {
    setTestEnv();
    attachTestDatabase();
    attachTestBucket();
    const fd = new FormData();
    fd.set("photo", jpegFile());

    await expect(uploadPhotoAction("no-such-id", fd)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("rejects when the photo field is not a file", async () => {
    setTestEnv();
    attachTestDatabase();
    attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const fd = new FormData();
    fd.set("photo", "not-a-file");

    await expect(uploadPhotoAction(created.id, fd)).rejects.toThrow("No file");
  });

  it("rejects an unsupported mime type", async () => {
    setTestEnv();
    attachTestDatabase();
    attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const fd = new FormData();
    fd.set("photo", new File([new Uint8Array(10)], "doc.pdf", { type: "application/pdf" }));

    await expect(uploadPhotoAction(created.id, fd)).rejects.toThrow("Tipe file tidak didukung");
  });

  it("rejects a file larger than 5MB", async () => {
    setTestEnv();
    attachTestDatabase();
    attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const fd = new FormData();
    fd.set("photo", jpegFile(5 * 1024 * 1024 + 1));

    await expect(uploadPhotoAction(created.id, fd)).rejects.toThrow("File terlalu besar (maks 5MB)");
  });

  it("rejects once the invitation already has 12 photos", async () => {
    setTestEnv();
    attachTestDatabase();
    attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const db = await getDb();
    for (let i = 0; i < 12; i++) {
      await db.insert(photos).values({ id: `p${i}`, invitationId: created.id, r2Key: `k${i}.jpg`, order: i, createdAt: i });
    }
    const fd = new FormData();
    fd.set("photo", jpegFile());

    await expect(uploadPhotoAction(created.id, fd)).rejects.toThrow("Maksimal 12 foto");
  });

  it("writes the photo to R2, inserts a row with the next order and revalidates the builder path", async () => {
    setTestEnv();
    attachTestDatabase();
    const bucket = attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const db = await getDb();
    await db.insert(photos).values({ id: "existing", invitationId: created.id, r2Key: "existing.jpg", order: 0, createdAt: 0 });
    const fd = new FormData();
    fd.set("photo", jpegFile());

    await uploadPhotoAction(created.id, fd);

    const rows = await db.select().from(photos).where(eq(photos.invitationId, created.id));
    expect(rows).toHaveLength(2);
    const inserted = rows.find((row) => row.id !== "existing")!;
    expect(inserted.order).toBe(1);
    expect(inserted.r2Key).toMatch(new RegExp(`^${created.id}/.+\\.jpg$`));
    expect(bucket.size()).toBe(1);
    expect(getRevalidatedPaths()).toEqual([`/builder/${created.id}`]);
  });

  it("rolls back the R2 write when inserting the photo row fails", async () => {
    setTestEnv();
    attachTestDatabase();
    const bucket = attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const db = await getDb();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("11111111-1111-1111-1111-111111111111");
    await db.insert(photos).values({
      id: "11111111-1111-1111-1111-111111111111",
      invitationId: created.id,
      r2Key: "existing.jpg",
      order: 0,
      createdAt: 0,
    });
    const fd = new FormData();
    fd.set("photo", jpegFile());

    await expect(uploadPhotoAction(created.id, fd)).rejects.toThrow();

    expect(bucket.size()).toBe(0);
  });

  it("still rethrows the original insert error when the rollback delete itself fails", async () => {
    setTestEnv();
    attachTestDatabase();
    const bucket = attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const db = await getDb();
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("22222222-2222-2222-2222-222222222222");
    await db.insert(photos).values({
      id: "22222222-2222-2222-2222-222222222222",
      invitationId: created.id,
      r2Key: "existing.jpg",
      order: 0,
      createdAt: 0,
    });
    bucket.delete = async () => {
      throw new Error("delete failed");
    };
    const fd = new FormData();
    fd.set("photo", jpegFile());

    await expect(uploadPhotoAction(created.id, fd)).rejects.toThrow(/Failed query: insert into "photos"/);
  });
});

describe("deletePhotoAction", () => {
  it("throws NotFoundError for an unknown invitation", async () => {
    setTestEnv();
    attachTestDatabase();
    attachTestBucket();

    await expect(deletePhotoAction("no-such-id", "p1")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("returns silently when the photo row does not exist", async () => {
    setTestEnv();
    attachTestDatabase();
    attachTestBucket();
    const created = await createInvitation(user.id, baseInput);

    await expect(deletePhotoAction(created.id, "no-such-photo")).resolves.toBeUndefined();
    expect(getRevalidatedPaths()).toEqual([]);
  });

  it("deletes the photo from R2 and the database, then revalidates the builder path", async () => {
    setTestEnv();
    attachTestDatabase();
    const bucket = attachTestBucket();
    const created = await createInvitation(user.id, baseInput);
    const db = await getDb();
    await db.insert(photos).values({ id: "p1", invitationId: created.id, r2Key: "k1.jpg", order: 0, createdAt: 0 });
    await bucket.put("k1.jpg", new ArrayBuffer(4), {});

    await deletePhotoAction(created.id, "p1");

    const rows = await db.select().from(photos).where(eq(photos.invitationId, created.id));
    expect(rows).toHaveLength(0);
    expect(bucket.size()).toBe(0);
    expect(getRevalidatedPaths()).toEqual([`/builder/${created.id}`]);
  });
});
