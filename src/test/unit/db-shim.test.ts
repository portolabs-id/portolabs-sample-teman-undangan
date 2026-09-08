import { describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { setTestEnv, attachTestDatabase } from "../support/env";

describe("test D1 shim", () => {
  it("runs real SQL through drizzle", async () => {
    setTestEnv();
    attachTestDatabase();
    const db = await getDb();
    const row = {
      id: "i1", userId: "u1", slug: "a-b", template: "classic",
      groomName: "Budi", groomParents: "", brideName: "Siti", brideParents: "",
      akadAt: null, resepsiAt: null, venueName: "", venueAddress: "", mapsUrl: null,
      giftBankName: null, giftAccountNumber: null, giftAccountHolder: null,
      giftQrisKey: null, coverPhotoKey: null, status: "draft" as const,
      createdAt: 1, updatedAt: 1,
    };
    await db.insert(invitations).values(row);
    const rows = await db.select().from(invitations);
    expect(rows).toHaveLength(1);
    expect(rows[0].groomName).toBe("Budi");
  });
});
