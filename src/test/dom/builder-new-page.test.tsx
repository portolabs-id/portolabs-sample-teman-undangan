import { describe, it, expect, vi } from "vitest";
import { attachTestDatabase } from "@/test/support/env";
import { captureRedirect } from "@/test/support/next";
import { getDb } from "@/lib/db";
import { invitations } from "@/lib/db/schema";

vi.mock("@/lib/auth/server", () => ({
  requireUser: vi.fn(),
}));

import { requireUser } from "@/lib/auth/server";
import NewInvitationPage from "@/app/(app)/builder/new/page";

const USER = { id: "u1", email: "a@b.com" };

describe("NewInvitationPage", () => {
  it("redirects to the latest existing invitation instead of creating another draft", async () => {
    attachTestDatabase();
    vi.mocked(requireUser).mockResolvedValue(USER as never);
    const db = await getDb();
    await db.insert(invitations).values({
      id: "i1",
      userId: "u1",
      slug: "budi-siti-111111",
      groomName: "Budi",
      brideName: "Siti",
      status: "draft",
      createdAt: 1,
      updatedAt: 2,
    });

    const url = await captureRedirect(async () => {
      await NewInvitationPage();
    });

    expect(url).toBe("/builder/i1");

    const rows = await db.select().from(invitations);
    expect(rows).toHaveLength(1);
  });

  it("creates a new draft invitation and redirects to it when none exists", async () => {
    attachTestDatabase();
    vi.mocked(requireUser).mockResolvedValue(USER as never);
    const db = await getDb();

    const url = await captureRedirect(async () => {
      await NewInvitationPage();
    });

    const rows = await db.select().from(invitations);
    expect(rows).toHaveLength(1);
    expect(url).toBe(`/builder/${rows[0].id}`);
    expect(rows[0].userId).toBe("u1");
    expect(rows[0].status).toBe("draft");
  });
});
