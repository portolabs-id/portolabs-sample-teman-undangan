import { describe, expect, it } from "vitest";
import { setTestEnv, attachTestBucket } from "../support/env";
import { GET } from "@/app/api/media/[...key]/route";

describe("GET /api/media/[...key]", () => {
  it("serves a stored object with its content type and an immutable cache header", async () => {
    setTestEnv();
    const bucket = attachTestBucket();
    const body = new TextEncoder().encode("fake-image-bytes").buffer;
    await bucket.put("inv-1/photo.jpg", body, { httpMetadata: { contentType: "image/jpeg" } });

    const res = await GET(new Request("http://localhost/api/media/inv-1/photo.jpg"), {
      params: Promise.resolve({ key: ["inv-1", "photo.jpg"] }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array(body));
  });

  it("returns a 404 with 'Not found' when the key has no stored object", async () => {
    setTestEnv();
    attachTestBucket();

    const res = await GET(new Request("http://localhost/api/media/missing.jpg"), {
      params: Promise.resolve({ key: ["missing.jpg"] }),
    });

    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not found");
  });

  it("rejoins a key that arrives as multiple path segments", async () => {
    setTestEnv();
    const bucket = attachTestBucket();
    const body = new TextEncoder().encode("segmented").buffer;
    await bucket.put("inv-2/uuid.png", body, { httpMetadata: { contentType: "image/png" } });

    const res = await GET(new Request("http://localhost/api/media/inv-2/uuid.png"), {
      params: Promise.resolve({ key: ["inv-2", "uuid.png"] }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
  });

  it("rejoins a key that arrives as one percent-encoded segment (%2F)", async () => {
    setTestEnv();
    const bucket = attachTestBucket();
    const body = new TextEncoder().encode("encoded").buffer;
    await bucket.put("inv-3/uuid.webp", body, { httpMetadata: { contentType: "image/webp" } });

    const res = await GET(new Request("http://localhost/api/media/inv-3%2Fuuid.webp"), {
      params: Promise.resolve({ key: ["inv-3%2Fuuid.webp"] }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/webp");
  });
});
