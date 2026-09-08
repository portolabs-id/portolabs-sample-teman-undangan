import { describe, it, expect } from "vitest";
import { RSVP_TURNSTILE_ACTION, REGISTER_TURNSTILE_ACTION } from "@/lib/turnstile/actions";

describe("turnstile action names", () => {
  it("exposes distinct action identifiers for rsvp and register flows", () => {
    expect(RSVP_TURNSTILE_ACTION).toBe("rsvp");
    expect(REGISTER_TURNSTILE_ACTION).toBe("register");
    expect(RSVP_TURNSTILE_ACTION).not.toBe(REGISTER_TURNSTILE_ACTION);
  });
});
