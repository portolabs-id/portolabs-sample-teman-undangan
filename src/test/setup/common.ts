import { afterEach, vi } from "vitest";

vi.mock("@opennextjs/cloudflare", async () => {
  const { getTestEnv } = await import("../support/env");
  return {
    getCloudflareContext: async () => ({ env: getTestEnv(), cf: undefined, ctx: { waitUntil: () => {} } }),
    initOpenNextCloudflareForDev: () => {},
    defineCloudflareConfig: (config: unknown) => config,
  };
});

vi.mock("next/headers", async () => {
  const { getRequestHeaders } = await import("../support/next");
  return {
    headers: async () => getRequestHeaders(),
    cookies: async () => new Map(),
  };
});

vi.mock("next/cache", async () => {
  const { recordRevalidatedPath } = await import("../support/next");
  return {
    revalidatePath: (path: string) => recordRevalidatedPath(path),
    revalidateTag: (tag: string) => recordRevalidatedPath(`tag:${tag}`),
    unstable_cache: (fn: unknown) => fn,
  };
});

vi.mock("next/navigation", async () => {
  const { RedirectError, NotFoundError } = await import("../support/next");
  return {
    redirect: (url: string) => {
      throw new RedirectError(url);
    },
    notFound: () => {
      throw new NotFoundError();
    },
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
  };
});

afterEach(async () => {
  const { resetTestEnv } = await import("../support/env");
  const { resetNextState } = await import("../support/next");
  resetTestEnv();
  resetNextState();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
