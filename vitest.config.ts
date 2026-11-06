import { defineConfig } from "vitest/config";
export default defineConfig({ test: {
  environment: "node", include: ["server/**/*.test.ts"],
  coverage: { provider: "v8", include: ["server/**/*.ts"], exclude: ["server/**/*.test.ts"],
    reporter: ["text", "html", "lcov", "json-summary"],
    thresholds: { lines: 70, statements: 70, functions: 70, branches: 60 } },
} });
