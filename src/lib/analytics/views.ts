import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Records one public invitation view in Analytics Engine.
 *
 * Writes are fire-and-forget: analytics must never break the page render.
 */
export async function recordInvitationView({
  slug,
  template,
  country,
  hasGuestName,
}: {
  slug: string;
  template: string;
  country: string;
  hasGuestName: boolean;
}): Promise<void> {
  const { env } = await getCloudflareContext({ async: true });
  try {
    env.INVITATION_ANALYTICS.writeDataPoint({
      indexes: [slug],
      blobs: [slug, template, country],
      doubles: [1, hasGuestName ? 1 : 0],
    });
  } catch {
    // Analytics Engine is best-effort; a failed data point is not an error.
  }
}
