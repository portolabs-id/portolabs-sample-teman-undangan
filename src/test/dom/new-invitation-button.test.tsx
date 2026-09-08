import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewInvitationButton } from "@/components/dashboard/new-invitation-button";

vi.mock("@/app/(app)/dashboard/actions", () => ({
  createDraftAction: vi.fn(),
}));

describe("NewInvitationButton", () => {
  it("renders a form with a submit button labelled Undangan baru", () => {
    const { container } = render(<NewInvitationButton />);
    expect(container.querySelector("form")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Undangan baru/ })).toHaveAttribute("type", "submit");
  });
});
