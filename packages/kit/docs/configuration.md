# Configuration

Monko Kit supports configuration via a `monko.config.ts` file in your project root.

## Monorepo Usage

In a monorepo, you typically run `monko-kit generate` within each package/app directory:

```bash
# Using pnpm workspaces
pnpm -r exec monko-kit generate

# Using turbo
turbo run generate

# Or manually in each package
cd apps/api && pnpm exec monko-kit generate
cd apps/web && pnpm exec monko-kit generate
```

## Configuration Options

```typescript
// monko.config.ts
import { defineConfig } from "@monko/orm";

export default defineConfig({
  outputDir: "src/generated",
  includes: [
    "src/schemas",
    "lib/models"
  ],
  excludes: [
    "**/test/**",
    "**/*.test.ts"
  ]
});
```

### `outputDir` (required)
Directory where generated TypeScript types will be written.

### `includes` (optional)
Array of specific directories to search for `.monko.ts` files. If not specified, searches the entire current directory.

**Benefits:**
- Faster generation (smaller search scope)
- More predictable behavior
- Better for large codebases

### `excludes` (optional)
Array of glob patterns to exclude from search. If not specified, uses sensible defaults:
- `**/node_modules/**`
- `**/dist/**`
- `**/.next/**`
- `**/coverage/**`
- `**/.git/**`
- `**/build/**`

**Custom excludes completely override defaults**, so include common patterns if needed.

## Examples

### Minimal Config
```typescript
export default defineConfig({
  outputDir: "generated"
});
```

### Next.js App
```typescript
export default defineConfig({
  outputDir: "src/types/generated",
  includes: ["schemas"],
  excludes: [
    "**/node_modules/**",
    "**/.next/**",
    "**/test/**"
  ]
});
```

### API Package
```typescript
export default defineConfig({
  outputDir: "src/generated",
  includes: [
    "src/schemas",
    "src/models"
  ]
});
``` 