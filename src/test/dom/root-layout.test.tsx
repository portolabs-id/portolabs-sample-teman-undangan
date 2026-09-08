import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

import RootLayout, { metadata } from "@/app/layout";

describe("RootLayout", () => {
  it("renders the html/body shell with font classes, children, and the Toaster", () => {
    // jsdom has no matchMedia implementation; sonner's Toaster reads it to
    // pick a theme on mount.
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    // React reconciles a rendered <html>/<body> against the real singleton
    // document nodes rather than nesting them inside the RTL container div,
    // so assert against document.documentElement / document.body.
    render(
      <RootLayout>
        <p>page content</p>
      </RootLayout>,
    );

    const html = document.documentElement;
    expect(html.getAttribute("lang")).toBe("id");
    expect(html.className).toContain("h-full");
    expect(html.className).toContain("antialiased");
    // The local next/font/google mock returns "--font-test" for all three
    // fonts, so the three variable classes collapse to three occurrences.
    expect(html.className.match(/--font-test/g)).toHaveLength(3);

    const body = document.body;
    expect(body.className).toBe("min-h-full flex flex-col");
    expect(body.textContent).toContain("page content");

    expect(document.querySelector('[aria-live="polite"]')).not.toBeNull();
  });

  it("exposes metadata for the app", () => {
    expect(metadata.title).toBe("Teman Undangan — undangan pernikahan digital");
    expect(metadata.openGraph).toMatchObject({ title: "Teman Undangan", type: "website" });
  });
});
