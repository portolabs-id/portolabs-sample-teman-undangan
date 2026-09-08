import { createTestD1, type TestD1 } from "./d1";
import { createTestR2, type TestR2 } from "./r2";

export type TestEnv = Partial<Record<string, unknown>> & {
  DB?: TestD1;
  MEDIA?: TestR2;
};

export type RateLimiterCall = { key: string };

const DEFAULT_VARS = {
  BETTER_AUTH_URL: "http://localhost:3000",
  BETTER_AUTH_SECRET: "test-secret-that-is-long-enough-for-better-auth",
  TURNSTILE_SITE_KEY: "",
  TURNSTILE_SECRET_KEY: "",
  TURNSTILE_HOSTNAMES: "",
};

let current: TestEnv = { ...DEFAULT_VARS };
let openDatabases: TestD1[] = [];

export function getTestEnv(): TestEnv {
  return current;
}

/** Replaces the whole env; anything omitted falls back to the default vars. */
export function setTestEnv(overrides: TestEnv = {}): TestEnv {
  current = { ...DEFAULT_VARS, ...overrides };
  return current;
}

/** Adds a migrated in-memory D1 to the current env and returns it. */
export function attachTestDatabase(): TestD1 {
  const database = createTestD1();
  openDatabases.push(database);
  current.DB = database;
  current.NEXT_TAG_CACHE_D1 = database;
  return database;
}

/** Adds an in-memory R2 bucket to the current env and returns it. */
export function attachTestBucket(): TestR2 {
  const bucket = createTestR2();
  current.MEDIA = bucket;
  return bucket;
}

/** Records every rate-limiter call and answers with `allowed`. */
export function attachRateLimiter(allowed = true): RateLimiterCall[] {
  const calls: RateLimiterCall[] = [];
  current.RSVP_RATE_LIMITER = {
    limit: async (call: RateLimiterCall) => {
      calls.push(call);
      return { success: allowed };
    },
  };
  return calls;
}

/** Records every Analytics Engine data point; `failing` makes writes throw. */
export function attachAnalytics({ failing = false } = {}): unknown[] {
  const dataPoints: unknown[] = [];
  current.INVITATION_ANALYTICS = {
    writeDataPoint: (point: unknown) => {
      if (failing) throw new Error("analytics unavailable");
      dataPoints.push(point);
    },
  };
  return dataPoints;
}

export function resetTestEnv(): void {
  for (const database of openDatabases) database.close();
  openDatabases = [];
  current = { ...DEFAULT_VARS };
}
