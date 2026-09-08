import { describe, expect, it } from "vitest";
import { isSiteverifyAcceptable } from "@/lib/turnstile/verify";

const hostnames = new Set(["temanundangan.portolabs.id"]);

describe("isSiteverifyAcceptable", () => {
  it("accepts a successful response for the expected action and hostname", () => {
    const result = { success: true, action: "rsvp", hostname: "temanundangan.portolabs.id" };
    expect(isSiteverifyAcceptable(result, { action: "rsvp", hostnames })).toBe(true);
  });

  it("rejects a failed verification", () => {
    const result = { success: false, action: "rsvp", hostname: "temanundangan.portolabs.id" };
    expect(isSiteverifyAcceptable(result, { action: "rsvp", hostnames })).toBe(false);
  });

  it("rejects a token minted for another action", () => {
    const result = { success: true, action: "register", hostname: "temanundangan.portolabs.id" };
    expect(isSiteverifyAcceptable(result, { action: "rsvp", hostnames })).toBe(false);
  });

  it("rejects a token solved on an unapproved hostname", () => {
    const result = { success: true, action: "rsvp", hostname: "evil.example.com" };
    expect(isSiteverifyAcceptable(result, { action: "rsvp", hostnames })).toBe(false);
  });

  it("rejects a response missing a hostname by falling back to an empty string", () => {
    const result = { success: true, action: "rsvp" };
    expect(isSiteverifyAcceptable(result, { action: "rsvp", hostnames })).toBe(false);
  });
});
