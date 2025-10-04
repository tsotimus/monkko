# @monkko/cli

High-performance developer toolkit for Monkko ORM, written in Go for maximum speed.

## Quick Start

```bash
# Initialize a new Monkko project
monkko init

# Generate types from schemas
monkko generate

# Validate schemas
monkko validate
```

## Architecture

```
packages/
├── orm/                    # TypeScript ORM package
├── cli/                    # Go CLI package
│   ├── cmd/               # CLI commands
│   ├── parser/            # Schema parsing logic
│   ├── generator/         # TypeScript generation
│   └── main.go           # Entry point
```

## Commands

```bash
# Initialize new project with config and .gitignore
monkko init

# Generate types from schemas
monkko generate

# Validate schemas
monkko validate
```

## Functionality

- **Initialize projects** with sensible defaults and .gitignore setup
- **Generate types** from schemas, looking at *.monkko.ts files
- **Validate schemas** for correctness
- **Built with Monorepo's in mind**, so can be used in any project

## Performance Goals

- **< 100ms** for type generation in most projects
- **< 50ms** startup time
- **Concurrent processing** of multiple schema files
- **Minimal memory footprint**

## Build Pipeline

1. Go builds to single binary for each platform
2. NPM package includes pre-built binaries
3. Falls back to Go compilation if binary not available 