import { test, expect } from "@playwright/test";
import { createPublishedInvitation } from "./support/account";

test.describe("RSVP", () => {
  test("a guest submits RSVP and the owner sees it with the right headcount", async ({ page, browser }) => {
    // `page` stays logged in as the invitation owner throughout.
    const { slug } = await createPublishedInvitation(page);
    const invitationUrl = new URL(page.url());
    const invitationId = invitationUrl.pathname.split("/").pop()!;

    // The guest is a separate, unauthenticated browser context.
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    const guestName = "Budi Santoso";

    await guestPage.goto(`/u/${slug}?to=${encodeURIComponent(guestName)}`);
    await guestPage.getByPlaceholder("Nama").fill(guestName);
    await guestPage.getByRole("combobox").selectOption("yes");
    await guestPage.getByRole("spinbutton").fill("2");
    await guestPage.getByPlaceholder("Ucapan & doa").fill("Selamat menempuh hidup baru!");
    await guestPage.getByRole("button", { name: "Kirim" }).click();

    // The guest sees their own entry appear on the invitation page.
    await expect(guestPage.getByText(guestName)).toBeVisible();
    await expect(guestPage.getByText("Selamat menempuh hidup baru!")).toBeVisible();
    await guestContext.close();

    // The owner sees it on the RSVP dashboard, with the correct headcount total.
    await page.goto(`/builder/${invitationId}/rsvps`);
    await expect(page.getByRole("heading", { name: "Daftar RSVP" })).toBeVisible();
    await expect(page.getByText(guestName)).toBeVisible();
    const summary = page.locator("p", { hasText: "Total konfirmasi hadir" });
    await expect(summary).toContainText("2");
    await expect(summary).toContainText("1 respons");
  });
});
