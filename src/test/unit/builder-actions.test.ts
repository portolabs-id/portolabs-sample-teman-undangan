import { describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { saveInvitationAction } from "@/app/(app)/builder/[id]/actions";
import { createInvitation } from "@/lib/invitations/queries";
import { invitationInput } from "@/lib/invitations/schema";
import { getDb } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { setTestEnv, attachTestDatabase } from "../support/env";
import { getRevalidatedPaths, NotFoundError } from "../support/next";

const user = { id: "u1", email: "u1@example.com" };

vi.mock("@/lib/auth/server", () => ({
  requireUser: async () => user,
}));

const baseInput = invitationInput.parse({ groomName: "Budi", brideName: "Siti" });

function fullFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("template", "floral");
  fd.set("groomName", "Budi");
  fd.set("groomParents", "Pak A & Bu B");
  fd.set("brideName", "Siti");
  fd.set("brideParents", "Pak C & Bu D");
  fd.set("akadAt", "2026-01-02T03:00:00.000Z");
  fd.set("resepsiAt", "2026-01-02T05:00:00.000Z");
  fd.set("venueName", "Gedung X");
  fd.set("venueAddress", "Jl. Y");
  fd.set("mapsUrl", "https://maps.google.com/x");
  fd.set("giftBankName", "BCA");
  fd.set("giftAccountNumber", "12345");
  fd.set("giftAccountHolder", "Budi");
  for (const [key, value] of Object.entries(overrides)) fd.set(key, value);
  return fd;
}

describe("saveInvitationAction", () => {
  it("throws NotFoundError for an invitation the user does not own", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation("someone-else", baseInput);

    await expect(saveInvitationAction(created.id, fullFormData())).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws NotFoundError for an unknown invitation id", async () => {
    setTestEnv();
    attachTestDatabase();

    await expect(saveInvitationAction("no-such-id", fullFormData())).rejects.toBeInstanceOf(NotFoundError);
  });

  it("parses and persists every field, revalidating the builder path", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation(user.id, baseInput);

    await saveInvitationAction(created.id, fullFormData());

    const db = await getDb();
    const [row] = await db.select().from(invitations).where(eq(invitations.id, created.id));
    expect(row).toMatchObject({
      template: "floral",
      groomName: "Budi",
      groomParents: "Pak A & Bu B",
      brideName: "Siti",
      brideParents: "Pak C & Bu D",
      akadAt: Date.parse("2026-01-02T03:00:00.000Z"),
      resepsiAt: Date.parse("2026-01-02T05:00:00.000Z"),
      venueName: "Gedung X",
      venueAddress: "Jl. Y",
      mapsUrl: "https://maps.google.com/x",
      giftBankName: "BCA",
      giftAccountNumber: "12345",
      giftAccountHolder: "Budi",
    });
    expect(getRevalidatedPaths()).toEqual([`/builder/${created.id}`]);
  });

  it("defaults omitted optional fields to empty strings or null", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation(user.id, baseInput);
    const fd = new FormData();
    fd.set("groomName", "Budi");
    fd.set("brideName", "Siti");

    await saveInvitationAction(created.id, fd);

    const db = await getDb();
    const [row] = await db.select().from(invitations).where(eq(invitations.id, created.id));
    expect(row).toMatchObject({
      template: "classic",
      groomParents: "",
      brideParents: "",
      akadAt: null,
      resepsiAt: null,
      venueName: "",
      venueAddress: "",
      mapsUrl: null,
      giftBankName: null,
      giftAccountNumber: null,
      giftAccountHolder: null,
    });
  });

  it("treats an unparseable date string as null", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation(user.id, baseInput);

    await saveInvitationAction(created.id, fullFormData({ akadAt: "not-a-date", resepsiAt: "not-a-date-either" }));

    const db = await getDb();
    const [row] = await db.select().from(invitations).where(eq(invitations.id, created.id));
    expect(row.akadAt).toBeNull();
    expect(row.resepsiAt).toBeNull();
  });

  it("treats an empty date string as null", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation(user.id, baseInput);

    await saveInvitationAction(created.id, fullFormData({ akadAt: "", resepsiAt: "" }));

    const db = await getDb();
    const [row] = await db.select().from(invitations).where(eq(invitations.id, created.id));
    expect(row.akadAt).toBeNull();
    expect(row.resepsiAt).toBeNull();
  });

  it("rejects a submission missing the required groom and bride names", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation(user.id, baseInput);
    const fd = new FormData();

    await expect(saveInvitationAction(created.id, fd)).rejects.toThrow();
  });
});
