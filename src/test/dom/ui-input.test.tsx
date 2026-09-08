import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("renders a native input with the given type", () => {
    render(<Input type="email" placeholder="you@example.com" />);
    const input = screen.getByPlaceholderText("you@example.com");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("data-slot", "input");
  });

  it("merges a custom className", () => {
    render(<Input placeholder="name" className="extra-class" />);
    expect(screen.getByPlaceholderText("name")).toHaveClass("extra-class");
  });
});
