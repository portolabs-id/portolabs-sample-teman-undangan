import { describe, it, expect } from "vitest";
import { rsvpInput } from "@/lib/rsvp/schema";

describe("rsvpInput", () => {
  it("requires a guest name and valid attendance", () => {
    expect(rsvpInput.safeParse({ guestName: "Andi", attendance: "yes", headcount: 2 }).success).toBe(true);
    expect(rsvpInput.safeParse({ guestName: "", attendance: "yes", headcount: 1 }).success).toBe(false);
    expect(rsvpInput.safeParse({ guestName: "Andi", attendance: "perhaps", headcount: 1 }).success).toBe(false);
  });
  it("clamps headcount to >= 1 default", () => {
    expect(rsvpInput.parse({ guestName: "Andi", attendance: "no" }).headcount).toBe(1);
  });

  it("coerces a numeric string headcount and enforces the 1-20 bounds", () => {
    expect(rsvpInput.parse({ guestName: "Andi", attendance: "yes", headcount: "5" }).headcount).toBe(5);
    expect(rsvpInput.safeParse({ guestName: "Andi", attendance: "yes", headcount: 0 }).success).toBe(false);
    expect(rsvpInput.safeParse({ guestName: "Andi", attendance: "yes", headcount: 20 }).success).toBe(true);
    expect(rsvpInput.safeParse({ guestName: "Andi", attendance: "yes", headcount: 21 }).success).toBe(false);
  });

  it("accepts an optional message up to 500 characters", () => {
    const withMessage = rsvpInput.parse({ guestName: "Andi", attendance: "yes", message: "Selamat!" });
    expect(withMessage.message).toBe("Selamat!");
    expect(rsvpInput.safeParse({ guestName: "Andi", attendance: "yes", message: "x".repeat(501) }).success).toBe(false);
  });
});
