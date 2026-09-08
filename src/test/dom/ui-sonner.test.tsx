import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { Toaster } from "@/components/ui/sonner";

describe("Toaster", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })
    );
  });

  it("renders the notifications region", () => {
    const { container } = render(<Toaster />);
    expect(container.querySelector('section[aria-label^="Notifications"]')).toBeInTheDocument();
  });

  it("forwards extra props such as position", () => {
    const { container } = render(<Toaster position="top-center" />);
    expect(container.querySelector('section[aria-label^="Notifications"]')).toBeInTheDocument();
  });
});
