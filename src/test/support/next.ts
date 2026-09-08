export class RedirectError extends Error {
  constructor(readonly url: string) {
    super(`NEXT_REDIRECT:${url}`);
    this.name = "RedirectError";
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("NEXT_NOT_FOUND");
    this.name = "NotFoundError";
  }
}

let requestHeaders = new Headers();
let revalidatedPaths: string[] = [];

export function getRequestHeaders(): Headers {
  return requestHeaders;
}

export function setRequestHeaders(init: Record<string, string>): Headers {
  requestHeaders = new Headers(init);
  return requestHeaders;
}

export function getRevalidatedPaths(): string[] {
  return revalidatedPaths;
}

export function recordRevalidatedPath(path: string): void {
  revalidatedPaths.push(path);
}

export function resetNextState(): void {
  requestHeaders = new Headers();
  revalidatedPaths = [];
}

/** Asserts the awaited call redirected, and returns the target URL. */
export async function captureRedirect(run: () => Promise<unknown>): Promise<string> {
  try {
    await run();
  } catch (error) {
    if (error instanceof RedirectError) return error.url;
    throw error;
  }
  throw new Error("Expected a redirect, but the call returned normally");
}
