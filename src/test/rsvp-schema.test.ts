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
});
