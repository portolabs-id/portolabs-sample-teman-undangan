import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 8787);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;
const isCI = Boolean(process.env.CI);

/**
 * End-to-end suite. `next dev` boots with the Cloudflare bindings wired by
 * `initOpenNextCloudflareForDev()`, so D1, R2 and the rate limiter are the local
 * Miniflare ones. `npm run e2e:setup` applies the migrations they need.
 *
 * Worker count is capped so a run never saturates the machine.
 */
export default defineConfig({
  testDir: "e2e",
  outputDir: "e2e/.results",
  fullyParallel: false,
  workers: 2,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: isCI ? [["github"], ["html", { outputFolder: "playwright-report", open: "never" }]] : [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
