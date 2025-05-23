# @monko/kit

High-performance developer toolkit for Monko ORM, written in Go for maximum speed.

## Architecture

```
packages/
├── orm/                    # TypeScript ORM package
├── kit/                    # Go CLI package
│   ├── cmd/               # CLI commands
│   ├── parser/            # Schema parsing logic
│   ├── generator/         # TypeScript generation
│   └── main.go           # Entry point
```

## Commands

```bash
# Generate types from schemas
@monko/kit generate

# Validate schemas
@monko/kit validate

# Initialize new project
@monko/kit init
```

## Functionality

- Generate types from schemas, looking at *.monko.ts files
- Validate schemas
- Initialize new project
- Built with Monorepo's in mind, so can be used in any project

## Performance Goals

- **< 100ms** for type generation in most projects
- **< 50ms** startup time
- **Concurrent processing** of multiple schema files
- **Minimal memory footprint**

## Build Pipeline

1. Go builds to single binary for each platform
2. NPM package includes pre-built binaries
3. Falls back to Go compilation if binary not available 