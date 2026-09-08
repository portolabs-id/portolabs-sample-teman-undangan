import { afterEach, describe, expect, it, vi } from "vitest";
import { getTurnstileSiteKey, verifyTurnstileToken } from "@/lib/turnstile/verify";
import { setTestEnv } from "../support/env";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const CONFIGURED = {
  TURNSTILE_SECRET_KEY: "test-secret",
  TURNSTILE_SITE_KEY: "test-site-key",
};

function bodyOf(fetchMock: ReturnType<typeof vi.fn>): URLSearchParams {
  return fetchMock.mock.calls[0][1].body as URLSearchParams;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getTurnstileSiteKey", () => {
  it("returns null when TURNSTILE_SITE_KEY is unset", async () => {
    setTestEnv({ TURNSTILE_SITE_KEY: undefined });
    expect(await getTurnstileSiteKey()).toBeNull();
  });

  it("returns null when TURNSTILE_SITE_KEY is an empty string", async () => {
    setTestEnv({ TURNSTILE_SITE_KEY: "" });
    expect(await getTurnstileSiteKey()).toBeNull();
  });

  it("returns null when TURNSTILE_SITE_KEY is whitespace only", async () => {
    setTestEnv({ TURNSTILE_SITE_KEY: "   " });
    expect(await getTurnstileSiteKey()).toBeNull();
  });

  it("returns the trimmed site key when configured", async () => {
    setTestEnv({ TURNSTILE_SITE_KEY: "  abc123  " });
    expect(await getTurnstileSiteKey()).toBe("abc123");
  });
});

describe("verifyTurnstileToken", () => {
  it("returns true when the secret key is not configured", async () => {
    setTestEnv({ TURNSTILE_SECRET_KEY: undefined, TURNSTILE_SITE_KEY: "site-key" });
    expect(await verifyTurnstileToken({ token: "some-token", action: "rsvp" })).toBe(true);
  });

  it("returns true when the site key is not configured", async () => {
    setTestEnv({ TURNSTILE_SECRET_KEY: "secret", TURNSTILE_SITE_KEY: undefined });
    expect(await verifyTurnstileToken({ token: "some-token", action: "rsvp" })).toBe(true);
  });

  it("returns false when the token is undefined", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    expect(await verifyTurnstileToken({ token: undefined, action: "rsvp" })).toBe(false);
  });

  it("returns false when the token is null", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    expect(await verifyTurnstileToken({ token: null, action: "rsvp" })).toBe(false);
  });

  it("returns false when the token is an empty string", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    expect(await verifyTurnstileToken({ token: "", action: "rsvp" })).toBe(false);
  });

  it("returns false when the token exceeds the maximum length", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    const tooLong = "a".repeat(2049);
    expect(await verifyTurnstileToken({ token: tooLong, action: "rsvp" })).toBe(false);
  });

  it("returns false when the token is not a string", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    expect(await verifyTurnstileToken({ token: 12345 as unknown as string, action: "rsvp" })).toBe(false);
  });

  it("returns false when TURNSTILE_HOSTNAMES is unset, leaving an empty hostname set", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: undefined });
    expect(await verifyTurnstileToken({ token: "valid-token", action: "rsvp" })).toBe(false);
  });

  it("returns false when TURNSTILE_HOSTNAMES is an empty string, leaving an empty hostname set", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "" });
    expect(await verifyTurnstileToken({ token: "valid-token", action: "rsvp" })).toBe(false);
  });

  it("includes remoteip in the siteverify request body when provided", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: "rsvp", hostname: "example.com" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyTurnstileToken({ token: "valid-token", action: "rsvp", remoteIp: "1.2.3.4" });

    expect(result).toBe(true);
    expect(bodyOf(fetchMock).get("remoteip")).toBe("1.2.3.4");
  });

  it("omits remoteip from the siteverify request body when not provided", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: "rsvp", hostname: "example.com" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyTurnstileToken({ token: "valid-token", action: "rsvp", remoteIp: null });

    expect(result).toBe(true);
    expect(bodyOf(fetchMock).get("remoteip")).toBeNull();
  });

  it("returns false when the siteverify response is not ok", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

    expect(await verifyTurnstileToken({ token: "valid-token", action: "rsvp" })).toBe(false);
  });

  it("returns false when the siteverify fetch throws a network error", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    expect(await verifyTurnstileToken({ token: "valid-token", action: "rsvp" })).toBe(false);
  });

  it("returns false when the siteverify response body fails to parse", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("invalid json");
        },
      }),
    );

    expect(await verifyTurnstileToken({ token: "valid-token", action: "rsvp" })).toBe(false);
  });

  it("returns true when siteverify confirms the action and hostname, tolerating messy hostname config", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: " example.com , ,other.com " });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, action: "rsvp", hostname: "example.com" }),
      }),
    );

    expect(await verifyTurnstileToken({ token: "valid-token", action: "rsvp" })).toBe(true);
  });

  it("calls the siteverify endpoint with the secret and token", async () => {
    setTestEnv({ ...CONFIGURED, TURNSTILE_HOSTNAMES: "example.com" });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: "rsvp", hostname: "example.com" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await verifyTurnstileToken({ token: "valid-token", action: "rsvp" });

    expect(fetchMock).toHaveBeenCalledWith(SITEVERIFY_URL, expect.objectContaining({ method: "POST" }));
    expect(bodyOf(fetchMock).get("secret")).toBe(CONFIGURED.TURNSTILE_SECRET_KEY);
    expect(bodyOf(fetchMock).get("response")).toBe("valid-token");
  });
});
