import { describe, expect, it } from "vitest";
import { getDb } from "@/lib/db";
import { invitations } from "@/lib/db/schema";
import { setTestEnv, attachTestDatabase } from "../support/env";

describe("getDb", () => {
  it("resolves a drizzle instance backed by the Cloudflare D1 binding", async () => {
    setTestEnv();
    attachTestDatabase();

    const db = await getDb();
    const rows = await db.select().from(invitations);

    expect(rows).toEqual([]);
  });
});
