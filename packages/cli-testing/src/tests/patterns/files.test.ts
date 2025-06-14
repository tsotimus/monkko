// Check if the generated files exist and have the correct name

import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const expectedSchemas: Record<string, string[]> = {
  "post.monko.ts": ["User", "Post"],
  "product.monko.ts": ["Product"],
};

// Stub for CLI output simulation - to be implemented
function getGeneratedSchemasForFile(file: keyof typeof expectedSchemas): string[] {
  const generatedDir = join(process.cwd(), "src/types/db");
  const files = readdirSync(generatedDir).filter(f => f.endsWith(".types.ts"));

  return (expectedSchemas[file] ?? []).filter((schema: string) =>
    files.includes(`${schema}.types.ts`)
  );
}

describe("CLI schema generation", () => {
  Object.entries(expectedSchemas).forEach(([file, schemas]) => {
    schemas.forEach((schema) => {
      it(`Should generate ${schema} types for the ${schema} Schema from ${file}`, () => {
        const generatedSchemas = getGeneratedSchemasForFile(file as keyof typeof expectedSchemas);
        expect(generatedSchemas).toContain(schema);
      });
    });
  });
});