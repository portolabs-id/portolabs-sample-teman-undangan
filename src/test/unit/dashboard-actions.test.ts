import { describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createDraftAction, setInvitationStatusAction } from "@/app/(app)/dashboard/actions";
import { createInvitation } from "@/lib/invitations/queries";
import { invitationInput } from "@/lib/invitations/schema";
import { getDb } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { setTestEnv, attachTestDatabase } from "../support/env";
import { captureRedirect, getRevalidatedPaths } from "../support/next";

const user = { id: "u1", email: "u1@example.com" };

vi.mock("@/lib/auth/server", () => ({
  requireUser: async () => user,
}));

const baseInput = invitationInput.parse({ groomName: "Budi", brideName: "Siti" });

describe("createDraftAction", () => {
  it("creates a draft invitation for the current user and redirects to its builder page", async () => {
    setTestEnv();
    attachTestDatabase();

    const url = await captureRedirect(() => createDraftAction());

    expect(url).toMatch(/^\/builder\//);
    const db = await getDb();
    const rows = await db.select().from(invitations).where(eq(invitations.userId, user.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].status).toBe("draft");
    expect(url).toBe(`/builder/${rows[0].id}`);
  });
});

describe("setInvitationStatusAction", () => {
  it("flips the status and revalidates the dashboard and builder paths", async () => {
    setTestEnv();
    attachTestDatabase();
    const created = await createInvitation(user.id, baseInput);

    await setInvitationStatusAction(created.id, "published");

    const db = await getDb();
    const [row] = await db.select().from(invitations).where(eq(invitations.id, created.id));
    expect(row.status).toBe("published");
    expect(getRevalidatedPaths()).toEqual(["/dashboard", `/builder/${created.id}`]);
  });
});
