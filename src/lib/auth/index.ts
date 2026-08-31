import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/lib/db";
import { REGISTER_TURNSTILE_ACTION } from "@/lib/turnstile/actions";
import { verifyTurnstileToken } from "@/lib/turnstile/verify";

const SIGN_UP_PATH = "/sign-up/email";

/** Rejects sign-ups whose Turnstile token does not verify. */
const turnstileGuard = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== SIGN_UP_PATH) return;
  const verified = await verifyTurnstileToken({
    token: ctx.headers?.get("x-turnstile-token"),
    action: REGISTER_TURNSTILE_ACTION,
    remoteIp: ctx.headers?.get("cf-connecting-ip"),
  });
  if (!verified) {
    throw new APIError("FORBIDDEN", { message: "Verifikasi keamanan gagal. Muat ulang halaman dan coba lagi." });
  }
});

async function build() {
  const db = await getDb();
  const { env } = await getCloudflareContext({ async: true });
  return betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite" }),
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    session: { expiresIn: 60 * 60 * 24 * 30 },
    hooks: { before: turnstileGuard },
  } satisfies BetterAuthOptions);
}

export type Auth = Awaited<ReturnType<typeof build>>;

let instance: Auth | null = null;
export async function initAuth(): Promise<Auth> {
  if (!instance) instance = await build();
  return instance;
}
