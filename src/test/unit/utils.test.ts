import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values passed via clsx conditionals", () => {
    expect(cn("base", false && "hidden", undefined, null, "extra")).toBe("base extra");
  });
});
