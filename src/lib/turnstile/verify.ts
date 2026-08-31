import { getCloudflareContext } from "@opennextjs/cloudflare";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
const SITEVERIFY_TIMEOUT_MS = 10_000;

export type SiteverifyResult = {
  success: boolean;
  action?: string;
  hostname?: string;
  "error-codes"?: string[];
};

/** A token is acceptable only when siteverify confirms it for this action and hostname. */
export function isSiteverifyAcceptable(
  result: SiteverifyResult,
  { action, hostnames }: { action: string; hostnames: Set<string> },
): boolean {
  return result.success && result.action === action && hostnames.has(result.hostname ?? "");
}

function trimmed(value: string | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

/**
 * The public site key, or `null` while Turnstile has not been provisioned yet.
 * A `null` key means the widget is not rendered and tokens are not required.
 */
export async function getTurnstileSiteKey(): Promise<string | null> {
  const { env } = await getCloudflareContext({ async: true });
  return trimmed(env.TURNSTILE_SITE_KEY);
}

async function expectedHostnames(): Promise<Set<string>> {
  const { env } = await getCloudflareContext({ async: true });
  const raw = env.TURNSTILE_HOSTNAMES ?? "";
  return new Set(raw.split(",").map((hostname) => hostname.trim()).filter(Boolean));
}

/**
 * Validates a `cf-turnstile-response` token server-side.
 *
 * Fails closed: any network error, non-2xx response, unexpected action or
 * unapproved hostname rejects the request. Returns `true` only when Turnstile
 * is not configured (no site key or no secret), so the app stays usable before
 * the widget keys are provisioned.
 */
export async function verifyTurnstileToken({
  token,
  action,
  remoteIp,
}: {
  token: string | null | undefined;
  action: string;
  remoteIp?: string | null;
}): Promise<boolean> {
  const { env } = await getCloudflareContext({ async: true });
  const secret = trimmed(env.TURNSTILE_SECRET_KEY);
  const siteKey = trimmed(env.TURNSTILE_SITE_KEY);
  if (!secret || !siteKey) return true;

  const hostnames = await expectedHostnames();
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) return false;
  if (hostnames.size === 0) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  let result: SiteverifyResult;
  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
      body,
    });
    if (!response.ok) return false;
    result = (await response.json()) as SiteverifyResult;
  } catch {
    return false;
  }

  return isSiteverifyAcceptable(result, { action, hostnames });
}
