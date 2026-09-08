import { test, expect } from "@playwright/test";
import { registerAccount, uniqueAccount } from "./support/account";

test.describe("authentication", () => {
  test("registering a new account lands the user on a fresh draft invitation", async ({ page }) => {
    await registerAccount(page);

    // /dashboard had nothing to show for a brand-new account, so it redirected
    // to /builder/new, which created and opened a draft.
    await expect(page).toHaveURL(/\/builder\/[^/]+$/);
    await expect(page.getByText("Draf", { exact: true })).toBeVisible();
  });

  test("visiting /dashboard signed out redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("logging in with wrong credentials shows an error toast", async ({ page }) => {
    const account = uniqueAccount();

    await page.goto("/login");
    await page.getByLabel("Email").fill(account.email);
    await page.getByLabel("Kata sandi").fill(account.password);
    await page.getByRole("button", { name: "Masuk" }).click();

    await expect(page.locator("[data-sonner-toast]")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
