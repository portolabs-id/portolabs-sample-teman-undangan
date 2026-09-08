import { describe, it, expect, afterEach, vi } from "vitest";
import { generateSlug } from "@/lib/invitations/slug";

describe("generateSlug", () => {
  it("kebab-cases the two names and appends a short suffix", () => {
    const slug = generateSlug({ groomName: "Budi Santoso", brideName: "Siti Aminah" });
    expect(slug).toMatch(/^budi-santoso-siti-aminah-[a-z0-9]{6}$/);
  });

  it("strips accents and non-alphanumerics", () => {
    const slug = generateSlug({ groomName: "José", brideName: "Renée!!" });
    expect(slug).toMatch(/^jose-renee-[a-z0-9]{6}$/);
  });

  describe("when crypto.getRandomValues yields bytes that base36-encode short", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("pads the suffix out to 6 characters", () => {
      vi.stubGlobal("crypto", {
        getRandomValues: (arr: Uint8Array) => {
          arr.fill(0);
          return arr;
        },
      });
      const slug = generateSlug({ groomName: "Budi", brideName: "Siti" });
      expect(slug).toBe("budi-siti-000000");
    });
  });
});
