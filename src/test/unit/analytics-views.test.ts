import { describe, expect, it } from "vitest";
import { recordInvitationView } from "@/lib/analytics/views";
import { setTestEnv, attachAnalytics } from "../support/env";

describe("recordInvitationView", () => {
  it("writes a data point with the guest name flag set to 1 when present", async () => {
    setTestEnv();
    const dataPoints = attachAnalytics();

    await recordInvitationView({ slug: "budi-siti", template: "classic", country: "ID", hasGuestName: true });

    expect(dataPoints).toEqual([
      {
        indexes: ["budi-siti"],
        blobs: ["budi-siti", "classic", "ID"],
        doubles: [1, 1],
      },
    ]);
  });

  it("writes a data point with the guest name flag set to 0 when absent", async () => {
    setTestEnv();
    const dataPoints = attachAnalytics();

    await recordInvitationView({ slug: "budi-siti", template: "classic", country: "ID", hasGuestName: false });

    expect(dataPoints).toEqual([
      {
        indexes: ["budi-siti"],
        blobs: ["budi-siti", "classic", "ID"],
        doubles: [1, 0],
      },
    ]);
  });

  it("swallows an Analytics Engine write failure instead of throwing", async () => {
    setTestEnv();
    attachAnalytics({ failing: true });

    await expect(
      recordInvitationView({ slug: "budi-siti", template: "classic", country: "ID", hasGuestName: true }),
    ).resolves.toBeUndefined();
  });
});
