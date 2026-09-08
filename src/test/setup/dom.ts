import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import React from "react";

const NEXT_IMAGE_ONLY_PROPS = ["fill", "priority", "unoptimized", "sizes", "quality", "loader", "placeholder"];

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const attributes = Object.fromEntries(
      Object.entries(props).filter(([name]) => !NEXT_IMAGE_ONLY_PROPS.includes(name)),
    );
    return React.createElement("img", attributes);
  },
}));

vi.mock("next/script", () => ({
  default: ({ strategy, ...rest }: Record<string, unknown>) =>
    React.createElement("script", { "data-strategy": strategy as string, ...rest }),
}));

// Named exports are listed explicitly: Vitest builds the mock module's exports
// from Object.keys(), which a getter-only Proxy would report as empty.
vi.mock("next/font/google", () => {
  const font = () => ({ variable: "--font-test", className: "font-test", style: { fontFamily: "test" } });
  return { Fraunces: font, Geist_Mono: font, Plus_Jakarta_Sans: font };
});

afterEach(() => cleanup());
