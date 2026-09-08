import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { attachTestDatabase } from "@/test/support/env";
import { captureRedirect } from "@/test/support/next";
import { getDb } from "@/lib/db";
import { invitations } from "@/lib/db/schema";

vi.mock("@/lib/auth/server", () => ({
  requireUser: vi.fn(),
}));

import { requireUser } from "@/lib/auth/server";
import DashboardPage from "@/app/(app)/dashboard/page";

const USER = { id: "u1", email: "a@b.com" };

describe("DashboardPage", () => {
  it("redirects to /builder/new when the user has no invitations", async () => {
    attachTestDatabase();
    vi.mocked(requireUser).mockResolvedValue(USER as never);

    const url = await captureRedirect(async () => {
      render(await DashboardPage());
    });

    expect(url).toBe("/builder/new");
  });

  it("renders a card per invitation with the couple title", async () => {
    attachTestDatabase();
    vi.mocked(requireUser).mockResolvedValue(USER as never);
    const db = await getDb();

    await db.insert(invitations).values([
      {
        id: "i1",
        userId: "u1",
        slug: "budi-siti-111111",
        groomName: "Budi",
        brideName: "Siti",
        status: "draft",
        createdAt: 1,
        updatedAt: 2,
      },
      {
        id: "i2",
        userId: "u1",
        slug: "rafi-dinda-222222",
        groomName: "Rafi",
        brideName: "Dinda",
        status: "published",
        createdAt: 1,
        updatedAt: 3,
      },
    ]);

    render(await DashboardPage());

    expect(screen.getByText("Undangan Saya")).toBeInTheDocument();
    expect(screen.getByText("Budi & Siti")).toBeInTheDocument();
    expect(screen.getByText("Rafi & Dinda")).toBeInTheDocument();
  });
});
