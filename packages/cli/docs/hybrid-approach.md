# Hybrid Node.js + Go Implementation

This document explains how the hybrid approach for schema extraction and type generation works in practice.

## Architecture Overview

The Monko Kit uses a two-stage hybrid approach:

1. **Node.js TypeScript Parser** (`scripts/extract-schemas.js`) - Extracts schema definitions from `.monko.ts` files
2. **Go Type Generator** (`cmd/generate.go`) - Generates TypeScript types from the extracted JSON schemas

```
*.monko.ts files → Node.js/TypeScript parser → JSON → Go generator → .types.ts files
```

## Benefits of This Approach

### ✅ **Reliable TypeScript Parsing**
- Uses TypeScript's own compiler API for AST parsing
- Proper handling of complex syntax
- Built-in type checking capabilities
- No fragile regex parsing

### ✅ **Fast Type Generation**
- Go handles the template-based type generation
- Concurrent processing of multiple schemas
- Minimal memory footprint
- Sub-100ms generation for most projects

### ✅ **Developer Experience**
- TypeScript errors caught early
- Proper IDE support for schema files
- Clear error messages with line numbers
- Optional type checking control

## Implementation Details

### Node.js Schema Extractor

**Location**: `scripts/extract-schemas.js`

**Features**:
- TypeScript AST parsing using `typescript` package
- Optional type checking with `--no-typecheck` flag
- Error handling with `--ignore-type-errors` flag
- JSON output for Go consumption

**Usage**:
```bash
# Basic extraction
node scripts/extract-schemas.js schema.monko.ts

# Skip type checking for faster parsing
node scripts/extract-schemas.js --no-typecheck *.monko.ts

# Continue despite type errors
node scripts/extract-schemas.js --ignore-type-errors schema.monko.ts
```

### Go Type Generator

**Location**: `cmd/generate.go`

**Process**:
1. Finds all `.monko.ts` files in the project
2. Calls Node.js extractor via `exec.Command`
3. Parses JSON output from Node.js
4. Generates TypeScript types using Go templates
5. Writes files to configured output directory

### Schema JSON Format

The Node.js extractor outputs JSON in this format:

```json
{
  "schemas": [
    {
      "name": "User",
      "db": "myapp",
      "collection": "users",
      "fields": {
        "name": {
          "type": "string",
          "required": true,
          "unique": false,
          "optional": false
        },
        "email": {
          "type": "string", 
          "required": true,
          "unique": true,
          "optional": false
        }
      },
      "options": {
        "timestamps": true
      }
    }
  ],
  "extractedAt": "2024-01-01T00:00:00.000Z",
  "files": ["path/to/schema.monko.ts"]
}
```

## NPM Package Integration

### Dependencies

The package includes TypeScript as a runtime dependency:

```json
{
  "dependencies": {
    "typescript": "^5.0.0"
  }
}
```

### Scripts

Useful npm scripts for development:

```json
{
  "scripts": {
    "test:extractor": "node scripts/extract-schemas.js test/example.monko.ts",
    "test:generate": "./bin/monko generate",
    "dev:extract": "node scripts/extract-schemas.js"
  }
}
```

### Build Process

The hybrid approach requires both Node.js and Go at build time:

1. **postinstall**: Downloads Go dependencies and builds platform binary
2. **Runtime**: Node.js extracts schemas, Go generates types

## Error Handling

### TypeScript Errors

```bash
❌ TypeScript errors found:
  schema.monko.ts(5,10): Property 'invalidField' does not exist on type...
```

### Parsing Errors

```bash
Error parsing schema User: Failed to parse schema configuration: ...
```

### Go Generation Errors

```bash
failed to generate types: template execution failed for User: ...
```

## Performance Characteristics

- **Schema Extraction**: ~10-50ms for typical projects
- **Type Generation**: ~20-100ms for typical projects  
- **Total**: Usually under 100ms end-to-end
- **Memory**: Minimal footprint due to streaming JSON

## Testing the Implementation

### Test the Extractor Directly

```bash
# Test with example schema
pnpm run test:extractor

# Test with type checking
node scripts/extract-schemas.js test/example.monko.ts

# Test without type checking
node scripts/extract-schemas.js --no-typecheck test/example.monko.ts
```

### Test the Full Pipeline

```bash
# Full generation workflow
pnpm run test:generate
# or
./bin/monko generate
```

### Example Output

**Input** (`test/example.monko.ts`):
```typescript
export const User = defineSchema({
  name: "User",
  db: "myapp", 
  collection: "users",
  fields: {
    name: fields.string({ required: true }),
    email: fields.string({ required: true, unique: true })
  },
  options: { timestamps: true }
});
```

**Output** (`generated/User.types.ts`):
```typescript
import type { ObjectId } from 'mongodb';

export type UserDocument = {
  _id: ObjectId;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateUserInput = Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateUserInput = Partial<CreateUserInput>;
```

## Future Improvements

### Phase 2: Pure Go
- Replace Node.js with TypeScript-Go when mature
- Single binary with zero Node.js dependency
- Even faster startup times

### Enhanced Type Checking
- Integration with TypeScript project references
- Custom tsconfig.json support
- Advanced schema validation

### Template Customization
- User-defined type generation templates
- Plugin system for custom field types
- Framework-specific type generation 