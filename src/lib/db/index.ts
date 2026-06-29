import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export type DB = ReturnType<typeof makeDb>;

function makeDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export async function getDb(): Promise<DB> {
  const { env } = await getCloudflareContext({ async: true });
  return makeDb(env.DB);
}
