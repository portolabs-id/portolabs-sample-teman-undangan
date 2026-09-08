import { describe, it, expect } from "vitest";
import { invitationInput, DRAFT_DEFAULTS } from "@/lib/invitations/schema";

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

  it("rejects a valid but non-http mapsUrl such as ftp://", () => {
    const r = invitationInput.safeParse({ groomName: "Budi", brideName: "Siti", mapsUrl: "ftp://example.com/x" });
    expect(r.success).toBe(false);
  });

  it("applies every field default when only the required names are given", () => {
    const r = invitationInput.parse({ groomName: "Budi", brideName: "Siti" });
    expect(r).toEqual({
      template: "classic",
      groomName: "Budi",
      groomParents: "",
      brideName: "Siti",
      brideParents: "",
      akadAt: null,
      resepsiAt: null,
      venueName: "",
      venueAddress: "",
      mapsUrl: null,
      giftBankName: null,
      giftAccountNumber: null,
      giftAccountHolder: null,
    });
  });

  it("enforces the groomName min/max length bounds", () => {
    expect(invitationInput.safeParse({ groomName: "", brideName: "Siti" }).success).toBe(false);
    expect(invitationInput.safeParse({ groomName: "A", brideName: "Siti" }).success).toBe(true);
    expect(invitationInput.safeParse({ groomName: "x".repeat(80), brideName: "Siti" }).success).toBe(true);
    expect(invitationInput.safeParse({ groomName: "x".repeat(81), brideName: "Siti" }).success).toBe(false);
  });

  it("enforces the groomParents max length bound", () => {
    expect(invitationInput.safeParse({ groomName: "Budi", brideName: "Siti", groomParents: "x".repeat(200) }).success).toBe(true);
    expect(invitationInput.safeParse({ groomName: "Budi", brideName: "Siti", groomParents: "x".repeat(201) }).success).toBe(false);
  });

  it("exposes a parsed DRAFT_DEFAULTS invitation ready to prefill a new draft", () => {
    expect(DRAFT_DEFAULTS.template).toBe("classic");
    expect(DRAFT_DEFAULTS.groomName).toBe("Mempelai Pria");
    expect(DRAFT_DEFAULTS.brideName).toBe("Mempelai Wanita");
    expect(DRAFT_DEFAULTS.mapsUrl).toBeNull();
    expect(DRAFT_DEFAULTS.akadAt).toBeNull();
  });
});
