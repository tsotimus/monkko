import { defineConfig } from "@monko/orm/config";

export default defineConfig({
  outputDir: "types/monko",
  excludes: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/.git/**",
    "**/build/**"
  ]
});
