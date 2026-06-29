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
});
