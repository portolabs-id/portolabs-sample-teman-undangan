import { test, expect } from "@playwright/test";
import { registerAccount, fillBuilderWizard, publishInvitation, sampleInvitationFields } from "./support/account";

test.describe("builder wizard", () => {
  test("fills, saves, persists across reload, then publishes", async ({ page }) => {
    const { invitationId } = await registerAccount(page);
    const fields = sampleInvitationFields();

    await fillBuilderWizard(page, fields);

    // Reload and walk back through the wizard steps to confirm everything saved.
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/builder/${invitationId}$`));
    await page.waitForLoadState("networkidle");

    await page.getByRole("button", { name: "Mempelai" }).click();
    await expect(page.getByLabel("Nama pria")).toHaveValue(fields.groomName);
    await expect(page.getByLabel("Nama wanita")).toHaveValue(fields.brideName);
    await expect(page.getByLabel("Orang tua pria")).toHaveValue(fields.groomParents);
    await expect(page.getByLabel("Orang tua wanita")).toHaveValue(fields.brideParents);

    await page.getByRole("button", { name: "Acara" }).click();
    await expect(page.getByLabel("Akad")).toHaveValue(fields.akadAt);
    await expect(page.getByLabel("Resepsi")).toHaveValue(fields.resepsiAt);
    await expect(page.getByLabel("Nama tempat")).toHaveValue(fields.venueName);
    await expect(page.getByLabel("Alamat")).toHaveValue(fields.venueAddress);
    await expect(page.getByLabel("Link Google Maps")).toHaveValue(fields.mapsUrl);

    await page.getByRole("button", { name: "Amplop digital" }).click();
    await expect(page.getByLabel("Bank")).toHaveValue(fields.giftBankName);
    await expect(page.getByLabel("No. rekening")).toHaveValue(fields.giftAccountNumber);
    await expect(page.getByLabel("Atas nama")).toHaveValue(fields.giftAccountHolder);

    // Publish from the gallery step and confirm the status flips.
    await page.getByRole("button", { name: "Galeri foto" }).click();
    const slug = await publishInvitation(page);
    expect(slug).toBeTruthy();
    await expect(page.getByText("Terbit", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat undangan" })).toHaveAttribute("href", `/u/${slug}`);
  });
});
