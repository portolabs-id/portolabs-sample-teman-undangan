import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "@/components/ui/label";

describe("Label", () => {
  it("renders a native label with the given text and htmlFor", () => {
    render(<Label htmlFor="email">Email</Label>);
    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "email");
    expect(label).toHaveAttribute("data-slot", "label");
  });

  it("merges a custom className", () => {
    render(<Label className="extra-class">Name</Label>);
    expect(screen.getByText("Name")).toHaveClass("extra-class");
  });
});
