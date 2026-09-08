import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestEnv } from "../support/env";

const { betterAuthMock, FakeAPIError } = vi.hoisted(() => {
  class FakeAPIError extends Error {
    status: string;
    body?: { message?: string };
    constructor(status: string, body?: { message?: string }) {
      super(body?.message);
      this.name = "APIError";
      this.status = status;
      this.body = body;
    }
  }
  return { betterAuthMock: vi.fn((options: unknown) => ({ __options: options })), FakeAPIError };
});

vi.mock("better-auth", () => ({
  betterAuth: (options: unknown) => betterAuthMock(options),
}));

vi.mock("better-auth/api", () => ({
  APIError: FakeAPIError,
  createAuthMiddleware: (fn: unknown) => fn,
}));

type Ctx = { path: string; headers?: Headers };
type CapturedOptions = {
  baseURL: string;
  secret: string;
  database: unknown;
  hooks: { before: (ctx: Ctx) => Promise<void> };
};

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  betterAuthMock.mockClear();
});

/**
 * `vi.resetModules()` clears the registry for real modules, but the mocked
 * `@opennextjs/cloudflare` binds to whichever `support/env` module instance
 * is live the first time it is triggered and keeps using that instance for
 * the rest of the file (mocked modules are not re-evaluated by
 * `resetModules()`). Memoising the dynamic import keeps every test on that
 * same `support/env` instance instead of drifting onto a fresh one that the
 * already-bound mock would never see.
 */
let envModPromise: Promise<typeof import("../support/env")> | null = null;
function getEnvMod() {
  if (!envModPromise) envModPromise = import("../support/env");
  return envModPromise;
}

async function loadAuthModule(envOverrides?: TestEnv) {
  vi.resetModules();
  const { setTestEnv, attachTestDatabase } = await getEnvMod();
  setTestEnv(envOverrides);
  attachTestDatabase();
  return import("@/lib/auth");
}

describe("initAuth", () => {
  it("builds once and memoises the instance on subsequent calls", async () => {
    const { initAuth } = await loadAuthModule();

    const first = await initAuth();
    const second = await initAuth();

    expect(first).toBe(second);
    expect(betterAuthMock).toHaveBeenCalledTimes(1);
  });

  it("configures betterAuth with the env baseURL/secret and a drizzle adapter", async () => {
    const { initAuth } = await loadAuthModule({ BETTER_AUTH_URL: "https://example.test", BETTER_AUTH_SECRET: "s3cr3t-value" });

    await initAuth();

    const options = betterAuthMock.mock.calls[0][0] as CapturedOptions;
    expect(options.baseURL).toBe("https://example.test");
    expect(options.secret).toBe("s3cr3t-value");
    expect(typeof options.database).toBe("function");
    expect(typeof options.hooks.before).toBe("function");
  });
});

describe("turnstileGuard", () => {
  async function loadGuard(envOverrides?: TestEnv) {
    const { initAuth } = await loadAuthModule(envOverrides);
    await initAuth();
    const options = betterAuthMock.mock.calls[0][0] as CapturedOptions;
    return options.hooks.before;
  }

  it("does nothing for paths other than sign-up", async () => {
    const guard = await loadGuard();

    const result = await guard({ path: "/sign-in/email", headers: new Headers() });

    expect(result).toBeUndefined();
  });

  it("passes sign-up requests when Turnstile is not configured", async () => {
    const guard = await loadGuard();

    const result = await guard({
      path: "/sign-up/email",
      headers: new Headers({ "x-turnstile-token": "some-token" }),
    });

    expect(result).toBeUndefined();
  });

  it("throws a FORBIDDEN APIError when siteverify rejects the token", async () => {
    const guard = await loadGuard({
      TURNSTILE_SITE_KEY: "site-key",
      TURNSTILE_SECRET_KEY: "secret-key",
      TURNSTILE_HOSTNAMES: "example.test",
    });
    global.fetch = vi.fn(async () => new Response(JSON.stringify({ success: false }), { status: 200 })) as unknown as typeof fetch;

    await expect(
      guard({
        path: "/sign-up/email",
        headers: new Headers({ "x-turnstile-token": "bad-token", "cf-connecting-ip": "1.2.3.4" }),
      }),
    ).rejects.toMatchObject({
      status: "FORBIDDEN",
      message: "Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi.",
    });
  });

  it("rejects sign-up requests that arrive without headers", async () => {
    const guard = await loadGuard({
      TURNSTILE_SITE_KEY: "site-key",
      TURNSTILE_SECRET_KEY: "secret-key",
      TURNSTILE_HOSTNAMES: "example.test",
    });

    await expect(guard({ path: "/sign-up/email" })).rejects.toMatchObject({ status: "FORBIDDEN" });
  });
});
