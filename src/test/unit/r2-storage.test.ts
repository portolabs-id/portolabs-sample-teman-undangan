import { describe, expect, it } from "vitest";
import { deletePhoto, extFromType, getPhoto, mediaKey, putPhoto } from "@/lib/storage/r2";
import { setTestEnv, attachTestBucket } from "../support/env";

describe("extFromType", () => {
  it("maps image/jpeg to jpg", () => {
    expect(extFromType("image/jpeg")).toBe("jpg");
  });

  it("maps image/png to png", () => {
    expect(extFromType("image/png")).toBe("png");
  });

  it("maps image/webp to webp", () => {
    expect(extFromType("image/webp")).toBe("webp");
  });

  it("returns null for an unsupported mime type", () => {
    expect(extFromType("application/pdf")).toBeNull();
  });
});

describe("mediaKey", () => {
  it("builds a key namespaced by invitation id with a random file name", () => {
    const key = mediaKey("inv-1", "jpg");
    expect(key).toMatch(/^inv-1\/[0-9a-f-]{36}\.jpg$/);
  });
});

describe("putPhoto / getPhoto / deletePhoto", () => {
  it("round-trips a photo through the bucket", async () => {
    setTestEnv();
    attachTestBucket();
    const key = "inv-1/photo.jpg";
    const body = new TextEncoder().encode("fake-image-bytes").buffer;

    await putPhoto(key, body, "image/jpeg");
    const stored = await getPhoto(key);

    expect(stored).not.toBeNull();
    expect(new Uint8Array(stored!.body as unknown as ArrayBuffer)).toEqual(new Uint8Array(body));

    await deletePhoto(key);
    const afterDelete = await getPhoto(key);

    expect(afterDelete).toBeNull();
  });

  it("returns null when getting a key that was never stored", async () => {
    setTestEnv();
    attachTestBucket();

    const missing = await getPhoto("inv-1/missing.jpg");

    expect(missing).toBeNull();
  });
});
