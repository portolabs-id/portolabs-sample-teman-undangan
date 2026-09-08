import { describe, it, expect } from "vitest";
import { countdownParts, googleCalendarUrl } from "@/lib/dates";

describe("countdownParts", () => {
  it("breaks a future delta into d/h/m/s", () => {
    const now = 0;
    const target = ((1 * 24 + 2) * 60 + 3) * 60 * 1000 + 4000; // 1d 2h 3m 4s
    expect(countdownParts(target, now)).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4, done: false });
  });
  it("clamps past targets to zero and done=true", () => {
    expect(countdownParts(0, 1000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, done: true });
  });
});

describe("googleCalendarUrl", () => {
  it("builds a calendar render link with UTC dates", () => {
    const url = googleCalendarUrl({ title: "Akad", startMs: 0, endMs: 3600_000, details: "x", location: "y" });
    expect(url).toContain("https://www.google.com/calendar/render?action=TEMPLATE");
    expect(url).toContain("text=Akad");
    expect(url).toContain("dates=19700101T000000Z%2F19700101T010000Z");
  });
});
