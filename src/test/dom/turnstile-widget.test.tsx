import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { setTestEnv } from "@/test/support/env";
import { TurnstileWidget } from "@/components/turnstile-widget";

describe("TurnstileWidget", () => {
  it("renders nothing when no site key is configured", async () => {
    setTestEnv({ TURNSTILE_SITE_KEY: "" });
    const { container } = render(await TurnstileWidget({ action: "rsvp" }));
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the challenge script and div when a site key is configured", async () => {
    setTestEnv({ TURNSTILE_SITE_KEY: "test-site-key" });
    const { container } = render(await TurnstileWidget({ action: "rsvp" }));
    const script = document.head.querySelector("script");
    expect(script).toHaveAttribute("src", "https://challenges.cloudflare.com/turnstile/v0/api.js");
    const widget = container.querySelector(".cf-turnstile");
    expect(widget).toHaveAttribute("data-sitekey", "test-site-key");
    expect(widget).toHaveAttribute("data-action", "rsvp");
  });
});
