import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";

const VARIANTS = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
const SIZES = ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const;

describe("Button", () => {
  it.each(VARIANTS)("renders the %s variant", (variant) => {
    render(<Button variant={variant}>Label</Button>);
    expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
  });

  it.each(SIZES)("renders the %s size", (size) => {
    render(<Button size={size}>Label</Button>);
    expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
  });

  it("falls back to the default variant and size when omitted", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button", { name: "Default" });
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("merges a custom className via buttonVariants", () => {
    const classes = buttonVariants({ variant: "outline", size: "sm", className: "extra-class" });
    expect(classes).toContain("extra-class");
  });
});
