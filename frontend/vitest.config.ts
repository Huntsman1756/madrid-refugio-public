import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/app/**/*.test.ts",
      "src/app/**/*.test.tsx",
      "src/lib/**/*.test.ts",
      "src/lib/**/*.test.tsx",
      "src/components/**/*.test.ts",
      "src/components/**/*.test.tsx",
    ],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
