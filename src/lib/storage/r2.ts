import { getCloudflareContext } from "@opennextjs/cloudflare";

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function extFromType(type: string): string | null {
  return MIME_EXT[type] ?? null;
}

export function mediaKey(invId: string, ext: string): string {
  return `${invId}/${crypto.randomUUID()}.${ext}`;
}

export async function putPhoto(key: string, body: ArrayBuffer, contentType: string): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.MEDIA.put(key, body, { httpMetadata: { contentType } });
}

export async function getPhoto(key: string) {
  const { env } = await getCloudflareContext({ async: true });
  return env.MEDIA.get(key);
}

export async function deletePhoto(key: string): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  await env.MEDIA.delete(key);
}
