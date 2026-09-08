import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { getDb } from "@/lib/db";
import { invitations, photos } from "@/lib/db/schema";
import { setTestEnv, attachTestDatabase } from "../support/env";
import { NotFoundError } from "../support/next";
import BuilderPage from "@/app/(app)/builder/[id]/page";

vi.mock("@/lib/auth/server", () => ({
  requireUser: vi.fn(async () => ({ id: "u1", email: "owner@example.com", name: "Owner" })),
}));

vi.mock("@/app/(app)/builder/[id]/builder-wizard", () => ({
  BuilderWizard: (props: unknown) => (
    <div data-testid="wizard" data-props={JSON.stringify(props)} />
  ),
}));

function readWizardProps() {
  const el = screen.getByTestId("wizard");
  return JSON.parse(el.getAttribute("data-props")!) as {
    id: string;
    status: string;
    values: Record<string, string>;
    photos: { id: string; url: string }[];
  };
}

const baseInvitation = {
  id: "i1",
  userId: "u1",
  slug: "budi-siti-123456",
  template: "classic" as const,
  groomName: "Budi",
  groomParents: "",
  brideName: "Siti",
  brideParents: "",
  akadAt: null as number | null,
  resepsiAt: null as number | null,
  venueName: "",
  venueAddress: "",
  mapsUrl: null as string | null,
  giftBankName: null as string | null,
  giftAccountNumber: null as string | null,
  giftAccountHolder: null as string | null,
  giftQrisKey: null,
  coverPhotoKey: null,
  status: "draft" as const,
  createdAt: 1,
  updatedAt: 1,
};

describe("BuilderPage", () => {
  it("throws NotFoundError for an unknown invitation id", async () => {
    setTestEnv();
    attachTestDatabase();

    await expect(BuilderPage({ params: Promise.resolve({ id: "missing" }) })).rejects.toThrow(NotFoundError);
  });

  it("throws NotFoundError when the invitation belongs to another user", async () => {
    setTestEnv();
    attachTestDatabase();
    const db = await getDb();
    await db.insert(invitations).values({ ...baseInvitation, id: "i2", userId: "someone-else" });

    await expect(BuilderPage({ params: Promise.resolve({ id: "i2" }) })).rejects.toThrow(NotFoundError);
  });

  it("renders a draft invitation with the Draf pill, no public link, and empty ?? fallbacks", async () => {
    setTestEnv();
    attachTestDatabase();
    const db = await getDb();
    await db.insert(invitations).values({ ...baseInvitation, id: "i-draft", status: "draft" });

    render(await BuilderPage({ params: Promise.resolve({ id: "i-draft" }) }));

    expect(screen.getByText("Budi & Siti")).toBeInTheDocument();
    expect(screen.getByText("Draf")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Lihat undangan" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "RSVP" })).toHaveAttribute("href", "/builder/i-draft/rsvps");
    expect(screen.getByRole("link", { name: "Kembali" })).toHaveAttribute("href", "/dashboard");

    const props = readWizardProps();
    expect(props.status).toBe("draft");
    expect(props.values.akadAt).toBe("");
    expect(props.values.resepsiAt).toBe("");
    expect(props.values.mapsUrl).toBe("");
    expect(props.values.giftBankName).toBe("");
    expect(props.values.giftAccountNumber).toBe("");
    expect(props.values.giftAccountHolder).toBe("");
  });

  it("renders a published invitation with the Terbit pill, the public link, and every value filled", async () => {
    setTestEnv();
    attachTestDatabase();
    const db = await getDb();
    await db.insert(invitations).values({
      ...baseInvitation,
      id: "i-pub",
      status: "published",
      slug: "budi-siti-pub",
      akadAt: 1_800_000_000_000,
      resepsiAt: 1_800_010_000_000,
      mapsUrl: "https://maps.google.com/x",
      giftBankName: "BCA",
      giftAccountNumber: "123",
      giftAccountHolder: "Budi",
    });

    render(await BuilderPage({ params: Promise.resolve({ id: "i-pub" }) }));

    expect(screen.getByText("Terbit")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lihat undangan" })).toHaveAttribute("href", "/u/budi-siti-pub");
    expect(screen.getByRole("link", { name: "Lihat undangan" })).toHaveAttribute("target", "_blank");

    const props = readWizardProps();
    expect(props.status).toBe("published");
    expect(props.values.akadAt).toBe(String(1_800_000_000_000));
    expect(props.values.resepsiAt).toBe(String(1_800_010_000_000));
    expect(props.values.mapsUrl).toBe("https://maps.google.com/x");
    expect(props.values.giftBankName).toBe("BCA");
    expect(props.values.giftAccountNumber).toBe("123");
    expect(props.values.giftAccountHolder).toBe("Budi");
  });

  it("passes photos sorted by their order field, mapped to media urls", async () => {
    setTestEnv();
    attachTestDatabase();
    const db = await getDb();
    await db.insert(invitations).values({ ...baseInvitation, id: "i-gallery" });
    await db.insert(photos).values({ id: "p-c", invitationId: "i-gallery", r2Key: "c.jpg", order: 2, createdAt: 1 });
    await db.insert(photos).values({ id: "p-a", invitationId: "i-gallery", r2Key: "a.jpg", order: 0, createdAt: 2 });
    await db.insert(photos).values({ id: "p-b", invitationId: "i-gallery", r2Key: "b.jpg", order: 1, createdAt: 3 });

    render(await BuilderPage({ params: Promise.resolve({ id: "i-gallery" }) }));

    const props = readWizardProps();
    expect(props.photos.map((p) => p.id)).toEqual(["p-a", "p-b", "p-c"]);
    expect(props.photos.map((p) => p.url)).toEqual(["/api/media/a.jpg", "/api/media/b.jpg", "/api/media/c.jpg"]);
  });
});
