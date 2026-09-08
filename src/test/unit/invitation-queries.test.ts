import { describe, expect, it } from "vitest";
import {
  createInvitation,
  getInvitationForOwner,
  getPublishedBySlug,
  listInvitations,
  setStatus,
  updateInvitation,
} from "@/lib/invitations/queries";
import { invitationInput } from "@/lib/invitations/schema";
import { getDb } from "@/lib/db";
import { invitations, photos } from "@/lib/db/schema";
import { setTestEnv, attachTestDatabase } from "../support/env";

const baseInput = invitationInput.parse({
  groomName: "Budi",
  brideName: "Siti",
});

describe("createInvitation", () => {
  it("persists a row with a generated slug, draft status and timestamps, and returns it", async () => {
    setTestEnv();
    attachTestDatabase();

    const created = await createInvitation("u1", baseInput);

    expect(created.userId).toBe("u1");
    expect(created.status).toBe("draft");
    expect(created.giftQrisKey).toBeNull();
    expect(created.coverPhotoKey).toBeNull();
    expect(created.slug).toMatch(/^budi-siti-[a-z0-9]{6}$/);
    expect(created.createdAt).toBe(created.updatedAt);
    expect(typeof created.createdAt).toBe("number");

    const db = await getDb();
    const rows = await db.select().from(invitations);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual(created);
  });
});

describe("listInvitations", () => {
  it("orders by updatedAt descending and filters by userId", async () => {
    setTestEnv();
    attachTestDatabase();
    const db = await getDb();

    const rowFor = (over: Partial<typeof invitations.$inferInsert>) => ({
      id: over.id as string,
      userId: over.userId as string,
      slug: over.slug as string,
      template: "classic",
      groomName: "Budi",
      groomParents: "",
      brideName: "Siti",
      brideParents: "",
      akadAt: null,
      resepsiAt: null,
      venueName: "",
      venueAddress: "",
      mapsUrl: null,
      giftBankName: null,
      giftAccountNumber: null,
      giftAccountHolder: null,
      giftQrisKey: null,
      coverPhotoKey: null,
      status: "draft" as const,
      createdAt: over.createdAt as number,
      updatedAt: over.updatedAt as number,
    });

    await db.insert(invitations).values(rowFor({ id: "i1", userId: "u1", slug: "s1", createdAt: 1, updatedAt: 1 }));
    await db.insert(invitations).values(rowFor({ id: "i2", userId: "u1", slug: "s2", createdAt: 2, updatedAt: 3 }));
    await db.insert(invitations).values(rowFor({ id: "i3", userId: "u2", slug: "s3", createdAt: 4, updatedAt: 4 }));

    const result = await listInvitations("u1");

    expect(result.map((r) => r.id)).toEqual(["i2", "i1"]);
  });
});

describe("getInvitationForOwner", () => {
  it("returns the row for the owner", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);

    const found = await getInvitationForOwner("owner1", created.id);

    expect(found).toEqual(created);
  });

  it("returns null for a different user", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);

    const found = await getInvitationForOwner("someone-else", created.id);

    expect(found).toBeNull();
  });
});

describe("updateInvitation", () => {
  it("writes only for the owner and bumps updatedAt", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);

    const updatedInput = invitationInput.parse({ groomName: "Budi Baru", brideName: "Siti" });
    await updateInvitation("owner1", created.id, updatedInput);

    const afterOwnerUpdate = await getInvitationForOwner("owner1", created.id);
    expect(afterOwnerUpdate?.groomName).toBe("Budi Baru");
    expect(afterOwnerUpdate?.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);

    const otherInput = invitationInput.parse({ groomName: "Should Not Apply", brideName: "Siti" });
    await updateInvitation("someone-else", created.id, otherInput);

    const afterOtherUpdate = await getInvitationForOwner("owner1", created.id);
    expect(afterOtherUpdate?.groomName).toBe("Budi Baru");
  });
});

describe("setStatus", () => {
  it("flips draft to published for the owner", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);

    await setStatus("owner1", created.id, "published");

    const found = await getInvitationForOwner("owner1", created.id);
    expect(found?.status).toBe("published");
  });

  it("flips published back to draft for the owner", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);
    await setStatus("owner1", created.id, "published");

    await setStatus("owner1", created.id, "draft");

    const found = await getInvitationForOwner("owner1", created.id);
    expect(found?.status).toBe("draft");
  });

  it("does not change status for a different user", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);

    await setStatus("someone-else", created.id, "published");

    const found = await getInvitationForOwner("owner1", created.id);
    expect(found?.status).toBe("draft");
  });
});

describe("getPublishedBySlug", () => {
  it("returns the invitation and its photos for a published slug", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);
    await setStatus("owner1", created.id, "published");
    const db = await getDb();
    await db.insert(photos).values({ id: "p1", invitationId: created.id, r2Key: "g1.jpg", order: 0, createdAt: 1 });

    const result = await getPublishedBySlug(created.slug);

    expect(result?.invitation.id).toBe(created.id);
    expect(result?.photos).toHaveLength(1);
    expect(result?.photos[0].r2Key).toBe("g1.jpg");
  });

  it("returns null for an unknown slug", async () => {
    setTestEnv();
    attachTestDatabase();

    const result = await getPublishedBySlug("no-such-slug-xyz");

    expect(result).toBeNull();
  });

  it("returns null for a draft invitation with that slug", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("owner1", baseInput);

    const result = await getPublishedBySlug(created.slug);

    expect(result).toBeNull();
  });
});
