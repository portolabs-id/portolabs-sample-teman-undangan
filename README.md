# Teman Undangan

Digital wedding invitation builder built on **Next.js 16 (App Router)** deployed to **Cloudflare Workers** via `@opennextjs/cloudflare`.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, React 19) |
| Runtime | Cloudflare Workers (via @opennextjs/cloudflare 1.x) |
| Database | Cloudflare D1 + Drizzle ORM |
| Object storage | Cloudflare R2 (invitation photos) |
| Incremental cache | Cloudflare KV (`NEXT_INC_CACHE_KV`) + regional Cache API |
| Tag cache | Cloudflare D1 (`NEXT_TAG_CACHE_D1`, table `revalidations`) |
| Bot protection | Cloudflare Turnstile (RSVP + register) |
| Abuse control | Workers Rate Limiting binding (`RSVP_RATE_LIMITER`) |
| Analytics | Workers Analytics Engine (`teman_undangan_views`) + Workers observability |
| Auth | Better Auth (email + password) |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Testing | Vitest |

Production URL: **https://temanundangan.portolabs.id** (Workers custom domain).

---

## Features

- **Account dashboard** — register, log in, manage your invitation.
- **Invitation builder** — fill couple info, akad, resepsi, venue, and digital gift (bank transfer).
- **3 themes** — Classic, Floral, Modern (switchable from the dashboard).
- **Public SSR invitation page** at `/u/[slug]` with personalised guest greeting via `?to=<guest>`.
- **Photo gallery** — upload photos to R2; served via a signed-URL proxy.
- **RSVP + Guestbook** — guests submit attendance and a message; owner sees responses in dashboard.
- **Digital envelope** — bank account details with copy-to-clipboard.
- **Maps** — venue coordinates rendered as an embedded map link.
- **Countdown** — live client-side countdown to the wedding date.
- **Add-to-calendar** — generates Google Calendar and .ics links.
- **SEO** — `generateMetadata` per invitation for Open Graph sharing.

---

## Prerequisites

- Node.js 20+
- npm
- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- Wrangler authenticated: `npx wrangler login`

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create local secrets file

Copy the example and fill in your values:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:

```
BETTER_AUTH_SECRET=<any 32+ character random string>
BETTER_AUTH_URL=http://localhost:8787
```

> `.dev.vars` is git-ignored and must never be committed.

### 3. Generate Cloudflare types (optional but recommended)

```bash
npm run cf-typegen
```

### 4. Apply migrations locally

```bash
npx wrangler d1 migrations apply DB --local
```

### 5. Start the local dev server

```bash
npm run preview
```

This runs `opennextjs-cloudflare build && wrangler dev`, which gives you a full local Cloudflare Workers environment with D1 and R2 bindings on **http://localhost:8787**.

> **Alternative:** `npm run dev` starts Next.js dev server on port 3000 and is useful for rapid UI iteration, but D1/R2 bindings are not available without Wrangler.

---

## First-Time Cloud Setup

Run these commands once before your first deploy. All require `npx wrangler login` to be done first.

### Step 1: Create the D1 database

```bash
npx wrangler d1 create teman-undangan
```

Copy the `database_id` printed to stdout and paste it into `wrangler.jsonc`, replacing `PLACEHOLDER_RUN_D1_CREATE`:

```jsonc
"d1_databases": [
  { "binding": "DB", "database_name": "teman-undangan", "database_id": "<paste-id-here>" }
]
```

### Step 2: Create the R2 bucket and KV namespace

```bash
npx wrangler r2 bucket create teman-undangan-media
npx wrangler kv namespace create NEXT_INC_CACHE_KV
```

Paste the KV namespace `id` into `wrangler.jsonc` under `kv_namespaces`.

### Step 3: Apply migrations to production D1

```bash
npx wrangler d1 migrations apply DB --remote
```

### Step 4: Set production secrets

```bash
npx wrangler secret put BETTER_AUTH_SECRET
# Paste a 32+ character random string when prompted

npx wrangler secret put BETTER_AUTH_URL
# Paste your deployed Worker URL, e.g. https://teman-undangan.<account>.workers.dev
```

> **Note:** If you do not know the Worker URL yet, do a first deploy (Step 5 below), note the printed URL, then run `npx wrangler secret put BETTER_AUTH_URL` and deploy again.

### Step 5: Deploy

```bash
npm run deploy
```

Wrangler will print a live `*.workers.dev` URL on success.

### Step 6: Production smoke test

1. Visit the URL → register an account → create an invitation.
2. Fill in the builder (couple, akad, resepsi, venue, gift).
3. Upload a photo → publish the invitation.
4. Open `/u/<slug>` in an incognito window → submit an RSVP.
5. Return to the dashboard and confirm the RSVP appears.

---

## Migrations Workflow

After any schema change:

```bash
# 1. Generate a new migration file
npx drizzle-kit generate --name <descriptive-name>

# 2. Apply locally
npx wrangler d1 migrations apply DB --local

# 3. Apply to production
npx wrangler d1 migrations apply DB --remote
```

Migration SQL files live in `drizzle/`.

---

## Scripts Reference

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Next.js dev server (port 3000, no D1/R2) |
| `build` | `next build` | Standard Next.js build |
| `build:cf` | `opennextjs-cloudflare build` | Build for Cloudflare Workers |
| `preview` | `build:cf + wrangler dev` | Local Workers preview (port 8787, full bindings) |
| `deploy` | `build:cf + wrangler deploy` | Deploy to Cloudflare Workers |
| `cf-typegen` | `wrangler types ...` | Regenerate `cloudflare-env.d.ts` |
| `lint` | `eslint` | Lint the project |
| `typecheck` | `tsc --noEmit` | Type-check without emitting |
| `test` | `vitest run` | Unit + component tests |
| `test:watch` | `vitest` | Same suite in watch mode |
| `test:coverage` | `vitest run --coverage` | Same suite, fails below 100% coverage |
| `e2e` | `playwright test` | End-to-end suite (boots `next dev` on port 8787) |
| `e2e:setup` | `wrangler d1 migrations apply ... --local` | Prepare the local D1 for e2e |
| `e2e:install` | `playwright install ...` | One-time Chromium download |

---

## Testing & CI

Unit and component tests run under Vitest with a **100% coverage gate** (lines,
branches, functions, statements). End-to-end journeys run under Playwright against
`next dev` with local Cloudflare bindings.

```bash
npm run test:coverage      # unit + component, enforces the coverage gate
npm run e2e:setup          # once: apply D1 migrations to local Miniflare state
npm run e2e:install        # once: download Chromium
npm run e2e                # end-to-end journeys
```

See [docs/testing.md](docs/testing.md) for the test layout and the Worker-binding
fakes.

GitHub Actions (`.github/workflows/ci.yml`) runs four jobs on every push and pull
request: lint + typecheck, unit tests with the coverage gate, the Playwright
suite, and a Docker build of the deploy image using Blacksmith's
`setup-docker-builder` and `build-push-action`. Pull requests build the image
only; pushes to `main` publish it to GHCR.

The image in `Dockerfile` is a **deploy artifact**, not a runtime server: the app
runs on Cloudflare Workers, so the image carries the built OpenNext bundle plus a
pinned wrangler and its entrypoint is `wrangler deploy`.

---

## Environment Variables / Secrets

| Key | Where set | Description |
|---|---|---|
| `BETTER_AUTH_SECRET` | `.dev.vars` (local) / `wrangler secret` (prod) | Random 32+ char secret for Better Auth session signing |
| `BETTER_AUTH_URL` | `.dev.vars` (local) / `wrangler secret` (prod) | Full base URL of the deployment (used for auth callbacks) |
| `TURNSTILE_SITE_KEY` | `vars` in `wrangler.jsonc` | Public Turnstile site key. Empty string disables the widget and skips token verification |
| `TURNSTILE_HOSTNAMES` | `vars` in `wrangler.jsonc` | Comma-separated hostnames accepted in the siteverify response. Never include `localhost` in production |
| `TURNSTILE_SECRET_KEY` | `.dev.vars` (local) / `wrangler secret` (prod) | Turnstile secret key used for siteverify |

### Turnstile

Bot verification is active only when both `TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are set. With either missing, the widget is not rendered and `verifyTurnstileToken` returns `true` so the forms keep working. Once configured, verification fails closed on any siteverify error, action mismatch, or unapproved hostname.

To enable it:

```bash
# 1. Create the widget (dashboard: Turnstile > Add widget, mode "Managed",
#    hostnames: temanundangan.portolabs.id, localhost, 127.0.0.1)
# 2. Put the site key into wrangler.jsonc -> vars.TURNSTILE_SITE_KEY
# 3. Store the secret key
npx wrangler secret put TURNSTILE_SECRET_KEY
# 4. Redeploy
npm run deploy
```

### Rate limiting

`RSVP_RATE_LIMITER` allows 5 RSVP submissions per 60 seconds per `invitationId + client IP`. Tune it in `wrangler.jsonc` under `ratelimits`.

### View analytics

Public invitation views are written to the `teman_undangan_views` Analytics Engine dataset (index: slug; blobs: slug, template, country; doubles: 1 view, personalised-link flag). Query it with the SQL API:

```sql
SELECT blob1 AS slug, SUM(_sample_interval) AS views
FROM teman_undangan_views
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY slug ORDER BY views DESC
```

---

## Known Follow-ups / Non-MVP

The following items are out of scope for the initial release and intentionally deferred:

- **Google OAuth** — Better Auth supports it; credentials and callback wiring not configured.
- **QRIS image upload** — `gift_qris_key` column exists in the schema; upload UI is deferred.
- **i18n** — Indonesian only; no multi-language support.
- **Atomic photo cap** — The per-invitation photo limit is enforced per-request; a concurrent-write race condition is theoretically possible at high volume.
- **Music / audio background** — Not implemented.
- **QR check-in** — Not implemented.

---

## Project Structure (abbreviated)

```
src/
  app/            # Next.js App Router pages and API routes
  components/     # Shared UI components
  lib/            # DB (Drizzle), auth (Better Auth), utilities
  types/          # Shared TypeScript types (InvitationView, TemplateProps, …)
drizzle/          # SQL migration files (0000_init.sql, 0001_auth.sql)
wrangler.jsonc    # Cloudflare Workers configuration
open-next.config.ts
```
