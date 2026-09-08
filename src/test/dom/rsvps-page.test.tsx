import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { attachTestDatabase } from "@/test/support/env";
import { getDb } from "@/lib/db";
import { invitations, rsvps } from "@/lib/db/schema";

vi.mock("@/lib/auth/server", () => ({
  requireUser: vi.fn(),
}));

import { requireUser } from "@/lib/auth/server";
import RsvpsPage from "@/app/(app)/builder/[id]/rsvps/page";

const USER = { id: "u1", email: "a@b.com" };

async function insertInvitation() {
  const db = await getDb();
  await db.insert(invitations).values({
    id: "i1",
    userId: "u1",
    slug: "budi-siti-111111",
    groomName: "Budi",
    brideName: "Siti",
    status: "published",
    createdAt: 1,
    updatedAt: 2,
  });
  return db;
}

describe("RsvpsPage", () => {
  it("renders zero responses and a zero headcount for an empty list", async () => {
    attachTestDatabase();
    vi.mocked(requireUser).mockResolvedValue(USER as never);
    await insertInvitation();

    render(await RsvpsPage({ params: Promise.resolve({ id: "i1" }) }));

    expect(screen.getByText("Daftar RSVP")).toBeInTheDocument();
    expect(screen.getByText(/0 respons/)).toBeInTheDocument();
    expect(screen.getByText("0", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute("href", "/builder/i1");
  });

  it("sums headcount only for attending guests, labels every attendance state, and shows messages when present", async () => {
    attachTestDatabase();
    vi.mocked(requireUser).mockResolvedValue(USER as never);
    const db = await insertInvitation();

    await db.insert(rsvps).values([
      { id: "r1", invitationId: "i1", guestName: "Ani", attendance: "yes", headcount: 2, message: "Selamat ya!", createdAt: 3 },
      { id: "r2", invitationId: "i1", guestName: "Budi", attendance: "no", headcount: 1, message: null, createdAt: 2 },
      { id: "r3", invitationId: "i1", guestName: "Citra", attendance: "maybe", headcount: 3, message: null, createdAt: 1 },
    ]);

    render(await RsvpsPage({ params: Promise.resolve({ id: "i1" }) }));

    // Only the "yes" entry (headcount 2) counts toward the total.
    expect(screen.getByText("2", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText(/3 respons/)).toBeInTheDocument();

    expect(screen.getByText("Ani")).toBeInTheDocument();
    expect(screen.getByText(/Hadir \(2\)/)).toBeInTheDocument();
    expect(screen.getByText("Selamat ya!")).toBeInTheDocument();

    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText(/Tidak \(1\)/)).toBeInTheDocument();

    expect(screen.getByText("Citra")).toBeInTheDocument();
    expect(screen.getByText(/Mungkin \(3\)/)).toBeInTheDocument();
  });
});
