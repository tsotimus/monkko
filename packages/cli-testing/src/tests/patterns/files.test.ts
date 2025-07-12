// Check if the generated files exist and have the correct name

import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { EXPECTED_SCHEMAS } from '../config';


// Stub for CLI output simulation - to be implemented
function getGeneratedSchemasForFile(file: keyof typeof EXPECTED_SCHEMAS): string[] {
  const generatedDir = join(process.cwd(), "src/types/db");
  const files = readdirSync(generatedDir).filter(f => f.endsWith(".schema.ts"));

  return (EXPECTED_SCHEMAS[file] ?? []).filter((schema: string) =>
    files.includes(`${schema}.schema.ts`)
  );
}

describe("File generation", () => {
  Object.entries(EXPECTED_SCHEMAS).forEach(([file, schemas]) => {
    schemas.forEach((schema) => {
      it(`Should generate Zod schemas for the ${schema} Schema from ${file}`, () => {
        const generatedSchemas = getGeneratedSchemasForFile(file as keyof typeof EXPECTED_SCHEMAS);
        expect(generatedSchemas).toContain(schema);
      });
    });
  });
});