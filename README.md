# Teman Undangan

Digital wedding invitation builder built on **Next.js 16 (App Router)** deployed to **Cloudflare Workers** via `@opennextjs/cloudflare`.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, React 19) |
| Runtime | Cloudflare Workers (via @opennextjs/cloudflare 1.x) |
| Database | Cloudflare D1 + Drizzle ORM |
| Object storage | Cloudflare R2 (photos + ISR cache) |
| Auth | Better Auth (email + password) |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Testing | Vitest |

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

### Step 2: Create R2 buckets

```bash
npx wrangler r2 bucket create teman-undangan-media
npx wrangler r2 bucket create teman-undangan-cache
```

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
| `test` | `vitest run` | Run unit tests (14 tests) |

---

## Environment Variables / Secrets

| Key | Where set | Description |
|---|---|---|
| `BETTER_AUTH_SECRET` | `.dev.vars` (local) / `wrangler secret` (prod) | Random 32+ char secret for Better Auth session signing |
| `BETTER_AUTH_URL` | `.dev.vars` (local) / `wrangler secret` (prod) | Full base URL of the deployment (used for auth callbacks) |

---

## Known Follow-ups / Non-MVP

The following items are out of scope for the initial release and intentionally deferred:

- **Google OAuth** — Better Auth supports it; credentials and callback wiring not configured.
- **QRIS image upload** — `gift_qris_key` column exists in the schema; upload UI is deferred.
- **RSVP rate-limiting** — Only a published-status guard is in place today. Full IP-based rate-limiting is a known gap for production hardening.
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
