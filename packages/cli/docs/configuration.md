# Configuration

Monko CLI supports configuration via a `monko.config.ts` file in your project root.

## Getting Started

The easiest way to get started is with the `init` command:

```bash
# Creates monko.config.ts with sensible defaults
# Also updates/creates .gitignore to exclude generated types
@monko/cli init
```

This creates a `monko.config.ts` file with:
- `outputDir: "types/monko"`
- Sensible `excludes` patterns for common build directories
- Automatic `.gitignore` setup

## Monorepo Usage

In a monorepo, run `@monko/cli init` in each package/app that uses Monko:

```bash
# Initialize each package individually
cd apps/api && npx @monko/cli init
cd apps/web && npx @monko/cli init

# Then generate types as needed
pnpm -r exec @monko/cli generate
# or with turbo
turbo run generate
```

## Configuration Options

```typescript
// monko.config.ts (created by init command)
import { defineConfig } from "@monko/orm";

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
```

### `outputDir` (required)
Directory where generated TypeScript types will be written.
- **Default**: `"types/monko"` (via init command)
- **Fallback**: `"generated"` (if no config file)

### `includes` (optional)
Array of specific directories to search for `.monko.ts` files. If not specified, searches the entire current directory.

**Benefits:**
- Faster generation (smaller search scope)
- More predictable behavior
- Better for large codebases

### `excludes` (optional)
Array of glob patterns to exclude from search. 
- **Default**: Common build/dependency directories (via init command)
- **Fallback**: No excludes (if no config file)

## Manual Configuration Examples

If you prefer to create the config manually or customize beyond the defaults:

### Minimal Config
```typescript
export default defineConfig({
  outputDir: "src/types"
});
```

### Next.js App (Custom)
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

### API Package (Custom)
```typescript
export default defineConfig({
  outputDir: "src/generated",
  includes: [
    "src/schemas",
    "src/models"
  ],
  // Uses init command defaults for excludes
});
```

## .gitignore Integration

The `init` command automatically:
- Creates `.gitignore` if it doesn't exist
- Adds your `outputDir` to `.gitignore`
- Skips if the directory is already ignored

Example `.gitignore` addition:
```
# Monko generated types
types/monko
``` 