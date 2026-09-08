import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Brand } from "@/components/brand";

describe("Brand", () => {
  it("links to / by default", () => {
    render(<Brand />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
    expect(screen.getByText("teman")).toBeInTheDocument();
    expect(screen.getByText("undangan")).toBeInTheDocument();
  });

  it("links to the given href", () => {
    render(<Brand href="/dashboard" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/dashboard");
  });
});
