import { describe, it, expect } from "vitest";
import { mediaKey, extFromType } from "@/lib/storage/r2";

describe("mediaKey", () => {
  it("namespaces by invitation id and keeps the extension", () => {
    const k = mediaKey("inv1", "jpg");
    expect(k).toMatch(/^inv1\/[a-f0-9-]{36}\.jpg$/);
  });
});

describe("extFromType", () => {
  it("maps mime types to extensions", () => {
    expect(extFromType("image/jpeg")).toBe("jpg");
    expect(extFromType("image/png")).toBe("png");
    expect(extFromType("image/webp")).toBe("webp");
    expect(extFromType("application/pdf")).toBeNull();
  });
});
