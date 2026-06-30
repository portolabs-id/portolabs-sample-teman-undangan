import { describe, it, expect } from "vitest";
import { invitationInput } from "@/lib/invitations/schema";

describe("invitationInput", () => {
  it("accepts a minimal valid payload", () => {
    const r = invitationInput.safeParse({ groomName: "Budi", brideName: "Siti", template: "classic" });
    expect(r.success).toBe(true);
  });
  it("rejects an unknown template", () => {
    const r = invitationInput.safeParse({ groomName: "Budi", brideName: "Siti", template: "nope" });
    expect(r.success).toBe(false);
  });
  it("coerces empty optional strings to undefined-safe defaults", () => {
    const r = invitationInput.parse({ groomName: "Budi", brideName: "Siti", template: "classic" });
    expect(r.groomParents).toBe("");
  });
  it("accepts an http(s) mapsUrl", () => {
    const r = invitationInput.safeParse({ groomName: "Budi", brideName: "Siti", template: "classic", mapsUrl: "https://maps.google.com/x" });
    expect(r.success).toBe(true);
  });
  it("rejects a javascript: mapsUrl (XSS guard)", () => {
    const r = invitationInput.safeParse({ groomName: "Budi", brideName: "Siti", template: "classic", mapsUrl: "javascript:alert(1)" });
    expect(r.success).toBe(false);
  });
});
