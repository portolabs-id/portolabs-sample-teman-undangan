function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Crypto-based 6-char suffix; crypto.getRandomValues is available on Workers.
function suffix(): string {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(36))
    .join("")
    .slice(0, 6)
    .padEnd(6, "0");
}

export function generateSlug(names: { groomName: string; brideName: string }): string {
  const base = `${slugify(names.groomName)}-${slugify(names.brideName)}`.replace(/^-+|-+$/g, "");
  return `${base}-${suffix()}`;
}
