import { defineConfig } from "vitest/config";

/**
 * Tests are split into a Node project for server code and a jsdom project for
 * anything that renders. Worker counts stay below the core count so a local run
 * never saturates the machine.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    maxWorkers: "50%",
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "node",
          include: ["src/test/unit/**/*.test.ts"],
          setupFiles: ["src/test/setup/common.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: ["src/test/dom/**/*.test.tsx"],
          setupFiles: ["src/test/setup/common.ts", "src/test/setup/dom.ts"],
        },
      },
    ],
    coverage: {
      // Istanbul instruments the source directly. The v8 provider miscounts the
      // implicit else of an `if` that follows an `await`, which a 100% gate
      // cannot tolerate.
      provider: "istanbul",
      reportsDirectory: "coverage",
      reporter: ["text-summary", "html", "lcov", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/types/**", "**/*.d.ts"],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
