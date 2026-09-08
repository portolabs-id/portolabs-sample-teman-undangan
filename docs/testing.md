# Testing

Three layers, all runnable from a clean checkout.

| Layer | Command | What it covers |
| --- | --- | --- |
| Unit (node) | `npm run test` | Server code: libraries, queries, server actions, route handlers |
| Component (jsdom) | `npm run test` | Everything that renders: pages, layouts, templates, client components |
| End-to-end | `npm run e2e` | Real user journeys against `next dev` with local Cloudflare bindings |

`npm run test:coverage` enforces **100% lines, branches, functions and statements**
across `src/**`. The thresholds live in `vitest.config.ts`; CI fails the build when
any of them slips.

## Layout

```
src/test/unit/    node-environment tests   (project "unit")
src/test/dom/     jsdom tests              (project "dom")
src/test/setup/   global mocks, loaded automatically
src/test/support/ fakes for the Worker bindings
e2e/              Playwright specs
```

## Worker bindings in tests

`src/test/setup/common.ts` mocks `@opennextjs/cloudflare`, `next/headers`,
`next/cache` and `next/navigation` for every test. The Worker `env` those mocks
serve comes from `src/test/support/env.ts`:

- `setTestEnv(overrides)` — reset the env, then layer overrides on top
- `attachTestDatabase()` — an in-memory D1 built on Node's `node:sqlite`, migrated
  with the real files in `drizzle/`. Drizzle runs the SQL the app ships, so
  repository tests exercise the query planner rather than a chain of mocks.
- `attachTestBucket()` — an in-memory R2 for `env.MEDIA`
- `attachRateLimiter(allowed)` — returns the call log for assertions
- `attachAnalytics({ failing })` — returns the recorded data points

`src/test/support/next.ts` exposes `setRequestHeaders`, `getRevalidatedPaths` and
`captureRedirect` for asserting on redirects and revalidation.

Everything resets in `afterEach`. `getPublishedBySlug` is wrapped in React
`cache`, so give each test a distinct slug.

## End-to-end

```bash
npm run e2e:setup     # apply the D1 migrations to the local Miniflare state
npm run e2e:install   # one-time: download the Chromium build
npm run e2e
```

Playwright starts `next dev` on port 8787. `initOpenNextCloudflareForDev()` wires
the real bindings from `wrangler.jsonc` to local Miniflare, so D1, R2 and the rate
limiter behave like production without touching a live account. Turnstile stays
inert because `TURNSTILE_SECRET_KEY` is unset locally, which makes
`verifyTurnstileToken` skip verification.

Copy `.dev.vars.example` to `.dev.vars` first — better-auth needs
`BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`.

## CPU budget

Vitest runs on at most half the cores (`maxWorkers: "50%"`) and Playwright on two
workers, so a full local run leaves the machine usable.
