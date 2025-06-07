# Type Generation Approach

## Workflow

### Step 1: Extract Schema Definitions

Using esbuild to parse the .monko.ts files and extract the schema definitions.

### Step 2: Generate Types

Using go templates to generate the types.

## Benefits

- **Reliable**: Uses mature TypeScript parsing
- **Fast**: Go handles the generation
- **Simple**: Clear separation of concerns

