import Script from "next/script";
import { getTurnstileSiteKey } from "@/lib/turnstile/verify";

const TURNSTILE_SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Renders the Turnstile challenge inside a form. Implicit rendering injects the
 * `cf-turnstile-response` field, so a plain form submission carries the token.
 * Renders nothing while Turnstile has no site key configured.
 */
export async function TurnstileWidget({ action }: { action: string }) {
  const siteKey = await getTurnstileSiteKey();
  if (!siteKey) return null;
  return (
    <>
      <Script src={TURNSTILE_SCRIPT} strategy="afterInteractive" async defer />
      <div className="cf-turnstile" data-sitekey={siteKey} data-action={action} />
    </>
  );
}
