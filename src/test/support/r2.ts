type StoredObject = { body: ArrayBuffer; contentType?: string };

export type TestR2 = R2Bucket & { size: () => number };

/** In-memory stand-in for the `MEDIA` R2 bucket. */
export function createTestR2(): TestR2 {
  const objects = new Map<string, StoredObject>();

  const bucket = {
    async put(key: string, body: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }) {
      objects.set(key, { body, contentType: options?.httpMetadata?.contentType });
      return { key };
    },
    async get(key: string) {
      const stored = objects.get(key);
      if (!stored) return null;
      return {
        key,
        body: stored.body,
        writeHttpMetadata(headers: Headers) {
          if (stored.contentType) headers.set("content-type", stored.contentType);
        },
      };
    },
    async delete(key: string) {
      objects.delete(key);
    },
    size: () => objects.size,
  };

  return bucket as unknown as TestR2;
}
