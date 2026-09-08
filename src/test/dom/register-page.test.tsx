import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { setTestEnv } from "@/test/support/env";
import RegisterPage, { dynamic } from "@/app/(auth)/register/page";

describe("RegisterPage", () => {
  it("is force-dynamic so the Turnstile key is read at request time", () => {
    expect(dynamic).toBe("force-dynamic");
  });

  it("renders without the Turnstile widget when no site key is configured", async () => {
    setTestEnv();

    render(await RegisterPage());

    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(document.querySelector(".cf-turnstile")).toBeNull();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/login");
  });

  it("renders the Turnstile widget when a site key is configured", async () => {
    setTestEnv({ TURNSTILE_SITE_KEY: "site-key-123" });

    render(await RegisterPage());

    const widget = document.querySelector(".cf-turnstile");
    expect(widget).not.toBeNull();
    expect(widget?.getAttribute("data-sitekey")).toBe("site-key-123");
  });
});
