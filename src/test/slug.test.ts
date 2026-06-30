import { describe, it, expect } from "vitest";
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
});
