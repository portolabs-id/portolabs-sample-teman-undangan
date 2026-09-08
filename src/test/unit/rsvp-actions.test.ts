import { afterEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { listRsvps, submitRsvpAction } from "@/lib/rsvp/actions";
import { createInvitation } from "@/lib/invitations/queries";
import { getDb } from "@/lib/db";
import { invitations, rsvps } from "@/lib/db/schema";
import { invitationInput } from "@/lib/invitations/schema";
import { setRequestHeaders, getRevalidatedPaths } from "../support/next";
import { setTestEnv, attachTestDatabase, attachRateLimiter } from "../support/env";

const baseInput = invitationInput.parse({ groomName: "Budi", brideName: "Siti" });

async function publishedInvitation(userId = "owner1") {
  const created = await createInvitation(userId, baseInput);
  const db = await getDb();
  await db.update(invitations).set({ status: "published" }).where(eq(invitations.id, created.id));
  return { ...created, status: "published" as const };
}

function formData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe("submitRsvpAction", () => {
  it("inserts an rsvp row and revalidates the invitation path on the happy path", async () => {
    setTestEnv();
    attachTestDatabase();
    attachRateLimiter(true);
    setRequestHeaders({});
    const inv = await publishedInvitation();

    await submitRsvpAction(
      inv.id,
      formData({ guestName: "Andi", attendance: "yes", headcount: "2", message: "Selamat!" }),
    );

    const db = await getDb();
    const rows = await db.select().from(rsvps);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      invitationId: inv.id,
      guestName: "Andi",
      attendance: "yes",
      headcount: 2,
      message: "Selamat!",
    });
    expect(getRevalidatedPaths()).toContain(`/u/${inv.slug}`);
  });

  it("stores message as null when omitted from the form", async () => {
    setTestEnv();
    attachTestDatabase();
    attachRateLimiter(true);
    setRequestHeaders({});
    const inv = await publishedInvitation();

    await submitRsvpAction(inv.id, formData({ guestName: "Budi", attendance: "no" }));

    const db = await getDb();
    const rows = await db.select().from(rsvps);
    expect(rows[0].message).toBeNull();
  });

  it("defaults headcount to 1 when omitted from the form", async () => {
    setTestEnv();
    attachTestDatabase();
    attachRateLimiter(true);
    setRequestHeaders({});
    const inv = await publishedInvitation();

    await submitRsvpAction(inv.id, formData({ guestName: "Citra", attendance: "maybe" }));

    const db = await getDb();
    const rows = await db.select().from(rsvps);
    expect(rows[0].headcount).toBe(1);
  });

  it("throws when the rate limiter denies the request", async () => {
    setTestEnv();
    attachTestDatabase();
    attachRateLimiter(false);
    setRequestHeaders({});
    const inv = await publishedInvitation();

    await expect(
      submitRsvpAction(inv.id, formData({ guestName: "Andi", attendance: "yes" })),
    ).rejects.toThrow("Terlalu banyak kiriman. Coba lagi sebentar lagi.");
  });

  it("keys the rate limiter with the cf-connecting-ip header when present", async () => {
    setTestEnv();
    attachTestDatabase();
    const calls = attachRateLimiter(true);
    setRequestHeaders({ "cf-connecting-ip": "1.2.3.4" });
    const inv = await publishedInvitation();

    await submitRsvpAction(inv.id, formData({ guestName: "Andi", attendance: "yes" }));

    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe(`${inv.id}:1.2.3.4`);
  });

  it('keys the rate limiter with "unknown" when the cf-connecting-ip header is absent', async () => {
    setTestEnv();
    attachTestDatabase();
    const calls = attachRateLimiter(true);
    setRequestHeaders({});
    const inv = await publishedInvitation();

    await submitRsvpAction(inv.id, formData({ guestName: "Andi", attendance: "yes" }));

    expect(calls).toHaveLength(1);
    expect(calls[0].key).toBe(`${inv.id}:unknown`);
  });

  it("throws when Turnstile siteverify rejects the token", async () => {
    setTestEnv({
      TURNSTILE_SITE_KEY: "site-key",
      TURNSTILE_SECRET_KEY: "secret-key",
      TURNSTILE_HOSTNAMES: "example.com",
    });
    attachTestDatabase();
    attachRateLimiter(true);
    setRequestHeaders({});
    const inv = await publishedInvitation();
    global.fetch = vi.fn(async () => new Response(null, { status: 500 })) as unknown as typeof fetch;

    await expect(
      submitRsvpAction(
        inv.id,
        formData({ guestName: "Andi", attendance: "yes", "cf-turnstile-response": "token-value" }),
      ),
    ).rejects.toThrow("Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.");
  });

  it("throws for a draft invitation", async () => {
    setTestEnv();
    attachTestDatabase();
    attachRateLimiter(true);
    setRequestHeaders({});
    const created = await createInvitation("owner1", baseInput);

    await expect(
      submitRsvpAction(created.id, formData({ guestName: "Andi", attendance: "yes" })),
    ).rejects.toThrow("Undangan tidak tersedia");
  });

  it("throws for an unknown invitation", async () => {
    setTestEnv();
    attachTestDatabase();
    attachRateLimiter(true);
    setRequestHeaders({});

    await expect(
      submitRsvpAction("does-not-exist", formData({ guestName: "Andi", attendance: "yes" })),
    ).rejects.toThrow("Undangan tidak tersedia");
  });
});

describe("listRsvps", () => {
  it("returns an empty array when the invitation is not owned by the user", async () => {
    setTestEnv();
    attachTestDatabase();
    const inv = await publishedInvitation("owner1");

    const result = await listRsvps("someone-else", inv.id);

    expect(result).toEqual([]);
  });

  it("returns entries ordered by createdAt descending for the owner", async () => {
    setTestEnv();
    attachTestDatabase();
    attachRateLimiter(true);
    setRequestHeaders({});
    const inv = await publishedInvitation("owner1");

    await submitRsvpAction(inv.id, formData({ guestName: "First", attendance: "yes" }));
    await submitRsvpAction(inv.id, formData({ guestName: "Second", attendance: "no" }));

    const db = await getDb();
    const rows = await db.select().from(rsvps);
    // Force distinct createdAt ordering regardless of clock resolution.
    await db.update(rsvps).set({ createdAt: 1 }).where(eq(rsvps.id, rows[0].id));
    await db.update(rsvps).set({ createdAt: 2 }).where(eq(rsvps.id, rows[1].id));

    const result = await listRsvps("owner1", inv.id);

    expect(result.map((r) => r.guestName)).toEqual(["Second", "First"]);
  });
});
