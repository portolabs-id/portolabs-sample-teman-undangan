# Teman Undangan — Design Spec

**Date:** 2026-06-29
**Status:** Approved

## Overview

Teman Undangan is a digital wedding invitation builder. Logged-in users create
wedding invitations from a form + template picker, publish them at a public
SEO-friendly URL, share with guests, and collect RSVPs and guestbook messages.
Everything runs free on Cloudflare (Workers, D1, R2) with no external paid
services.

## Goals

- Users create and manage multiple wedding invitations from a dashboard.
- Each invitation is published at a public, server-rendered URL with optional
  per-guest personalization (`?to=<name>`).
- Guests can RSVP and leave guestbook messages.
- Invitations support photo galleries, digital gift info (bank/QRIS), maps,
  countdown, and add-to-calendar.

## Non-Goals (MVP)

- Non-wedding event types (birthday, aqiqah, etc.).
- Payments / paid plans / billing.
- Custom domains per invitation.
- Real-time collaboration.

## Tech Stack

| Concern        | Choice                                         |
| -------------- | ---------------------------------------------- |
| Framework      | Next.js 15 (App Router)                         |
| Hosting        | Cloudflare Workers via `@opennextjs/cloudflare` |
| Database       | Cloudflare D1 (SQLite) + Drizzle ORM            |
| File storage   | Cloudflare R2 (gallery photos)                  |
| Auth           | Better Auth (email+password; Google OAuth optional later) |
| UI             | Tailwind CSS + shadcn/ui                         |
| Tooling        | Wrangler, TypeScript, Vitest                     |

All chosen because they run on Cloudflare's free tier with no external vendor.

## Architecture

```
Browser
  ├── /(public)/u/[slug]        SSR invitation page (guests, no auth)
  ├── /(auth)/login, /register  Better Auth flows
  └── /(app)/dashboard, /builder  authed app (invitation owners)
        │
        ▼
Next.js (App Router) on Cloudflare Workers
  ├── Server Components / Route Handlers / Server Actions
  ├── Better Auth handler (/api/auth/*)
  ├── Drizzle ORM ──► D1 (SQLite)
  └── R2 binding ──► photo upload/serve (signed/proxied)
```

### User Flow

1. User registers/logs in (Better Auth) → lands on **dashboard** listing their
   invitations.
2. **Builder**: form for couple info, akad/resepsi date+time, venue, maps URL,
   gift info (bank account / QRIS), template choice, photo uploads. Saves to D1
   (and R2 for photos).
3. Each invitation gets a unique **slug** → published at `/u/[slug]` (SSR).
   Optional `?to=<GuestName>` personalizes the greeting.
4. Guests open the link, view the invitation, submit **RSVP + guestbook
   message** → stored in D1 → shown in the public guestbook and the owner's
   dashboard.

## Data Model (D1 / Drizzle)

### Better Auth tables
`user`, `session`, `account`, `verification` — per Better Auth Drizzle adapter
schema.

### App tables

**invitation**
- `id` (text, pk)
- `userId` (text, fk → user.id)
- `slug` (text, unique)
- `template` (text) — e.g. `classic`, `floral`, `modern`
- `groomName`, `groomParents` (text)
- `brideName`, `brideParents` (text)
- `akadAt` (integer, epoch ms, nullable)
- `resepsiAt` (integer, epoch ms, nullable)
- `venueName`, `venueAddress` (text)
- `mapsUrl` (text, nullable)
- `giftBankName`, `giftAccountNumber`, `giftAccountHolder` (text, nullable)
- `giftQrisKey` (text, nullable, R2 key)
- `coverPhotoKey` (text, nullable, R2 key)
- `status` (text) — `draft` | `published`
- `createdAt`, `updatedAt` (integer)

**photo**
- `id` (text, pk)
- `invitationId` (text, fk)
- `r2Key` (text)
- `order` (integer)
- `createdAt` (integer)

**rsvp**
- `id` (text, pk)
- `invitationId` (text, fk)
- `guestName` (text)
- `attendance` (text) — `yes` | `no` | `maybe`
- `headcount` (integer, default 1)
- `message` (text, nullable) — doubles as guestbook entry
- `createdAt` (integer)

## Invitation Page Sections (template)

Hero (couple names + countdown) → couple profiles (+ parents) → events
(akad/resepsi with add-to-calendar) → maps embed → photo gallery → digital
envelope (bank/QRIS) → RSVP form + guestbook.

2–3 starter themes selectable per invitation (`classic`, `floral`, `modern`),
sharing one data model, differing in styling/layout.

## Component Boundaries

- **auth/** — Better Auth config, server helpers (`getSession`), route handler.
- **db/** — Drizzle client bound to D1, schema, migrations.
- **storage/** — R2 helpers: upload, key generation, proxied serving route.
- **invitations/** — CRUD server actions + queries (owner-scoped).
- **rsvp/** — public submit action + owner-side list query.
- **templates/** — one component per theme, fed a normalized `Invitation` view
  model so themes stay swappable.
- **builder/** — multi-step form UI + validation (zod).
- **dashboard/** — list, status, share link, RSVP summary.

## Error Handling

- All owner queries scoped by `userId`; 404 (not 403) for foreign/missing
  invitations to avoid leaking existence.
- Public invitation route: unknown slug → Next.js `notFound()`.
- RSVP submit: zod validation, rate-limit by IP+invitation (simple D1 or KV
  counter) to deter spam; on failure return field errors.
- Photo upload: validate mime/size before R2 put; cap photos per invitation.
- Auth failures handled by Better Auth; protected routes redirect to `/login`.

## Testing

- **Unit (Vitest):** slug generation, view-model mapping, zod schemas, date
  helpers (countdown, calendar links).
- **Integration:** Drizzle queries against a local D1 (miniflare/`wrangler dev`),
  RSVP submit + owner-scope enforcement.
- **Manual smoke:** register → build → publish → open public link → RSVP →
  see it in dashboard.

## Deployment

- `wrangler.jsonc` with D1 + R2 bindings; `@opennextjs/cloudflare` build.
- Migrations applied via Drizzle Kit + `wrangler d1 migrations apply`.
- Secrets (Better Auth secret, optional Google OAuth) via `wrangler secret`.

## Open Questions / Future

- Google OAuth: deferred; email+password ships first.
- Multi-language: Indonesian default; i18n not in MVP.
- More themes, music, e-ticket/QR check-in: post-MVP.
