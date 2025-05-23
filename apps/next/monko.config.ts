import { defineConfig } from "@monko/orm/config/defineConfig";

export default defineConfig({
  outputDir: "src/generated",
  includes: ["schemas", "src/models"],
}); 