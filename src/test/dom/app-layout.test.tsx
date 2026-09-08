import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import { captureRedirect } from "@/test/support/next";

vi.mock("@/lib/auth/server", () => ({
  requireUser: vi.fn(),
}));

import { requireUser } from "@/lib/auth/server";
import AppLayout from "@/app/(app)/layout";

describe("AppLayout", () => {
  it("renders the header and children for a logged-in user", async () => {
    vi.mocked(requireUser).mockResolvedValue({ id: "u1", email: "a@b.com" } as never);

    render(await AppLayout({ children: <p>inner content</p> }));

    expect(screen.getByText("Beranda")).toBeInTheDocument();
    expect(screen.getByText("inner content")).toBeInTheDocument();
  });

  it("propagates the redirect to /login when requireUser redirects", async () => {
    vi.mocked(requireUser).mockImplementation(() => {
      redirect("/login");
      throw new Error("unreachable");
    });

    const url = await captureRedirect(async () => {
      await AppLayout({ children: <p>inner content</p> });
    });

    expect(url).toBe("/login");
  });
});
