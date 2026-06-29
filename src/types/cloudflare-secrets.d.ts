// Extends the generated CloudflareEnv with runtime secrets configured via
// .dev.vars (local) and `wrangler secret put` (production).
interface CloudflareEnv {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}
