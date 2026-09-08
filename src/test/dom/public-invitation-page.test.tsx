import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { getDb } from "@/lib/db";
import { invitations, rsvps } from "@/lib/db/schema";
import { setTestEnv, attachTestDatabase, attachAnalytics } from "../support/env";
import { setRequestHeaders, NotFoundError } from "../support/next";
import PublicInvitation, { generateMetadata } from "@/app/u/[slug]/page";

// Rsvp nests an async server component (TurnstileWidget), which the client
// renderer used by RTL cannot handle. Rsvp itself is covered by
// src/test/dom/section-rsvp.test.tsx, so it is stubbed here to isolate the
// page's own assembly logic (guest handoff, template pick, analytics).
vi.mock("@/components/templates/sections/Rsvp", () => ({
  Rsvp: (props: unknown) => <div data-testid="rsvp" data-props={JSON.stringify(props)} />,
}));

const baseInvitation = {
  id: "i1",
  userId: "u1",
  slug: "slug-default",
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
  status: "published" as const,
  createdAt: 1,
  updatedAt: 1,
};

describe("generateMetadata", () => {
  it("returns a title, openGraph title, and description for a published slug", async () => {
    setTestEnv();
    attachTestDatabase();
    const db = await getDb();
    await db.insert(invitations).values({ ...baseInvitation, id: "meta-1", slug: "meta-found" });

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "meta-found" }) });

    expect(metadata.title).toBe("Undangan Pernikahan Budi & Siti");
    expect(metadata.openGraph).toEqual({ title: "Undangan Pernikahan Budi & Siti" });
    expect(metadata.description).toBe("Kami mengundang Anda di hari bahagia kami.");
  });

  it("returns a not-found title only when the slug does not resolve", async () => {
    setTestEnv();
    attachTestDatabase();

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "meta-missing" }) });

    expect(metadata).toEqual({ title: "Undangan tidak ditemukan" });
  });
});

describe("PublicInvitation", () => {
  it("throws NotFoundError when the slug has no published invitation", async () => {
    setTestEnv();
    attachTestDatabase();

    await expect(
      PublicInvitation({
        params: Promise.resolve({ slug: "missing-slug" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow(NotFoundError);
  });

  it("renders with a guest name and records the cf-ipcountry header", async () => {
    setTestEnv();
    attachTestDatabase();
    setRequestHeaders({ "cf-ipcountry": "ID" });
    const dataPoints = attachAnalytics();
    const db = await getDb();
    await db.insert(invitations).values({ ...baseInvitation, id: "with-to", slug: "render-with-to" });
    await db.insert(rsvps).values({
      id: "r1",
      invitationId: "with-to",
      guestName: "Wati",
      attendance: "yes",
      headcount: 2,
      message: "Selamat!",
      createdAt: 1,
    });

    const element = await PublicInvitation({
      params: Promise.resolve({ slug: "render-with-to" }),
      searchParams: Promise.resolve({ to: "Andi" }),
    });
    render(element);

    expect(screen.getByText("Andi")).toBeInTheDocument();
    const rsvpProps = JSON.parse(screen.getByTestId("rsvp").getAttribute("data-props")!);
    expect(rsvpProps.entries).toEqual([{ id: "r1", guestName: "Wati", attendance: "yes", message: "Selamat!" }]);
    expect(dataPoints).toHaveLength(1);
    expect(dataPoints[0]).toEqual({
      indexes: ["render-with-to"],
      blobs: ["render-with-to", "classic", "ID"],
      doubles: [1, 1],
    });
  });

  it("renders without a guest name and defaults the country to unknown when the header is absent", async () => {
    setTestEnv();
    attachTestDatabase();
    const dataPoints = attachAnalytics();
    const db = await getDb();
    await db.insert(invitations).values({ ...baseInvitation, id: "no-to", slug: "render-no-to" });

    const element = await PublicInvitation({
      params: Promise.resolve({ slug: "render-no-to" }),
      searchParams: Promise.resolve({}),
    });
    render(element);

    expect(screen.queryByText(/Kepada Yth\./)).not.toBeInTheDocument();
    expect(dataPoints[0]).toEqual({
      indexes: ["render-no-to"],
      blobs: ["render-no-to", "classic", "unknown"],
      doubles: [1, 0],
    });
  });
});
