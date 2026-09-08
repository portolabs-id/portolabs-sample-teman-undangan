import { randomUUID } from "node:crypto";
import { type Page, expect } from "@playwright/test";

export type Account = { email: string; password: string; name: string };

// Shared by every test that needs a login: any password >= 8 chars satisfies
// the app's minLength requirement.
const PASSWORD = "RahasiaAman123";

export function uniqueAccount(namePrefix = "Tamu Uji"): Account {
  return {
    email: `e2e-${randomUUID()}@example.test`,
    password: PASSWORD,
    name: `${namePrefix} ${randomUUID().slice(0, 8)}`,
  };
}

/**
 * Registers a brand-new account through the public /register form and waits
 * for the app to land the user logged in. A fresh account has no invitation,
 * so /dashboard bounces it through /builder/new into an auto-created draft at
 * /builder/<id> — that final URL is what we wait for.
 *
 * Turnstile verification is skipped server-side locally (no TURNSTILE_SECRET_KEY),
 * so the widget, if it renders at all, is ignored here.
 */
export async function registerAccount(
  page: Page,
  account: Account = uniqueAccount(),
): Promise<Account & { invitationId: string }> {
  await page.goto("/register");
  await page.getByLabel("Nama").fill(account.name);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Kata sandi").fill(account.password);
  await page.getByRole("button", { name: "Daftar" }).click();
  // The redirect chain briefly passes through /builder/new before the draft
  // is created and the final /builder/<id> URL settles.
  await expect(page).toHaveURL(/\/builder\/(?!new(?:$|\/))[^/]+$/, { timeout: 20_000 });
  await page.waitForLoadState("networkidle");
  const invitationId = new URL(page.url()).pathname.split("/").pop()!;
  return { ...account, invitationId };
}

export async function loginAccount(page: Page, account: Pick<Account, "email" | "password">) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Kata sandi").fill(account.password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

export type InvitationFields = {
  groomName: string;
  brideName: string;
  groomParents: string;
  brideParents: string;
  akadAt: string;
  resepsiAt: string;
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
  giftBankName: string;
  giftAccountNumber: string;
  giftAccountHolder: string;
};

export function sampleInvitationFields(overrides: Partial<InvitationFields> = {}): InvitationFields {
  return {
    groomName: "Rafi Pratama",
    brideName: "Dinda Kirana",
    groomParents: "Bpk. Sutrisno & Ibu Wulandari",
    brideParents: "Bpk. Hartono & Ibu Kirana",
    akadAt: "2026-12-12T08:00",
    resepsiAt: "2026-12-12T11:00",
    venueName: "Gedung Kartika",
    venueAddress: "Jl. Merdeka No. 10, Bandung",
    mapsUrl: "https://maps.app.goo.gl/abcXYZ123",
    giftBankName: "BCA",
    giftAccountNumber: "1234567890",
    giftAccountHolder: "Rafi Pratama",
    ...overrides,
  };
}

/**
 * Walks the builder wizard from the Tema step through to the Galeri step,
 * saving via "Lanjut" after each step (the wizard form covers every field at
 * once, so each click persists everything filled so far).
 */
async function clickLanjut(page: Page) {
  await page.getByRole("button", { name: "Lanjut" }).click();
}

export async function fillBuilderWizard(page: Page, fields: InvitationFields) {
  await expect(page.getByRole("heading", { name: "Tema", exact: true })).toBeVisible();
  await clickLanjut(page);

  await expect(page.getByRole("heading", { name: "Mempelai", exact: true })).toBeVisible();
  await page.getByLabel("Nama pria").fill(fields.groomName);
  await page.getByLabel("Nama wanita").fill(fields.brideName);
  await page.getByLabel("Orang tua pria").fill(fields.groomParents);
  await page.getByLabel("Orang tua wanita").fill(fields.brideParents);
  await clickLanjut(page);

  await expect(page.getByRole("heading", { name: "Acara", exact: true })).toBeVisible();
  await page.getByLabel("Akad").fill(fields.akadAt);
  await page.getByLabel("Resepsi").fill(fields.resepsiAt);
  await page.getByLabel("Nama tempat").fill(fields.venueName);
  await page.getByLabel("Alamat").fill(fields.venueAddress);
  await page.getByLabel("Link Google Maps").fill(fields.mapsUrl);
  await clickLanjut(page);

  await expect(page.getByRole("heading", { name: "Amplop digital", exact: true })).toBeVisible();
  await page.getByLabel("Bank").fill(fields.giftBankName);
  await page.getByLabel("No. rekening").fill(fields.giftAccountNumber);
  await page.getByLabel("Atas nama").fill(fields.giftAccountHolder);
  await clickLanjut(page);

  await expect(page.getByRole("heading", { name: "Galeri foto", exact: true })).toBeVisible();
}

/** Publishes the invitation currently open in the builder and returns its public slug. */
export async function publishInvitation(page: Page): Promise<string> {
  await page.getByRole("button", { name: "Terbitkan" }).click();
  await expect(page.getByText("Terbit", { exact: true })).toBeVisible();
  const href = await page.getByRole("link", { name: "Lihat undangan" }).getAttribute("href");
  if (!href) throw new Error("Published invitation link not found");
  return href.replace(/^\/u\//, "");
}

/** Reverts a published invitation back to draft, from the builder page. */
export async function unpublishInvitation(page: Page) {
  await page.getByRole("button", { name: "Jadikan draf" }).click();
  await expect(page.getByText("Draf", { exact: true })).toBeVisible();
}

/** Registers a fresh account, fills the wizard, and publishes it. Returns the public slug. */
export async function createPublishedInvitation(page: Page, overrides: Partial<InvitationFields> = {}) {
  const account = await registerAccount(page);
  const fields = sampleInvitationFields(overrides);
  await fillBuilderWizard(page, fields);
  const slug = await publishInvitation(page);
  return { account, fields, slug };
}
