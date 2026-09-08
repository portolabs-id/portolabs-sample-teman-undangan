import { test, expect } from "@playwright/test";

test.describe("landing page", () => {
  test("renders the pitch and calls to action", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Setiap tamu membuka undangan",
    );
    await expect(page.getByRole("link", { name: "Buat undangan" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Masuk", exact: true })).toBeVisible();
  });

  test("typing a guest name updates the greeting and the shareable link", async ({ page }) => {
    await page.goto("/");
    const guestInput = page.getByLabel("Tulis nama tamu");
    const figcaption = page.locator("figcaption");
    const shareLink = page.locator("code");

    // Default state: generic greeting, no `?to=` on the link.
    await expect(figcaption).toContainText("Bapak/Ibu/Saudara/i");
    await expect(shareLink).not.toContainText("?to=");

    await guestInput.fill("Budi Santoso");

    await expect(figcaption).toContainText("Budi Santoso");
    await expect(shareLink).toContainText("?to=Budi%20Santoso");
  });
});
