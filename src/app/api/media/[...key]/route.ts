import { getPhoto } from "@/lib/storage/r2";

export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  // Catch-all: photo keys contain a slash (`<invId>/<uuid>.<ext>`). Whether the
  // slash arrives encoded (%2F) or already decoded, the segments rejoin here, so
  // serving works on Cloudflare Workers (which decodes %2F before routing) and
  // locally alike.
  const obj = await getPhoto(key.map(decodeURIComponent).join("/"));
  if (!obj) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
}
