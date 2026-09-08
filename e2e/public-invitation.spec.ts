import { test, expect } from "@playwright/test";
import { createPublishedInvitation, unpublishInvitation } from "./support/account";

test.describe("public invitation page", () => {
  test("shows the couple title, the countdown, and greets a named guest", async ({ page }) => {
    const { fields, slug } = await createPublishedInvitation(page);

    await page.goto(`/u/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/u/${slug}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      `${fields.groomName} & ${fields.brideName}`,
    );
    // Countdown cells toward the akad date.
    await expect(page.getByText("Hari", { exact: true })).toBeVisible();
    await expect(page.getByText("Jam", { exact: true })).toBeVisible();

    await page.goto(`/u/${slug}?to=Budi%20Santoso`);
    await expect(page.getByText("Kepada Yth.")).toBeVisible();
    await expect(page.getByText("Budi Santoso")).toBeVisible();
  });

  test("an unknown or unpublished slug returns 404", async ({ page }) => {
    const unknownResponse = await page.goto("/u/tidak-ada-undangan-ini-000000");
    expect(unknownResponse?.status()).toBe(404);

    const { slug } = await createPublishedInvitation(page);
    await unpublishInvitation(page);

    const draftResponse = await page.goto(`/u/${slug}`);
    expect(draftResponse?.status()).toBe(404);
  });
});
