// Write some simple pattern tests. The patterns to look for are:
// - The schema field keys are the same as the type keys that are generated

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { 
  validateSchemaFile, 
  validateSchemaImports,
  type SchemaNameViolation,
  type MissingImportViolation,
  type SchemaStructureViolation,
  validateSchemaStructure
} from '@/utils';

describe('Schema Field Tests', () => {
  describe('Schema field keys match type keys', () => {
    it('should validate all schemas have field keys that match the type keys', () => {
      const schemasDir = join(process.cwd(), 'src/schemas');
      const schemaFiles = readdirSync(schemasDir).filter(file => file.endsWith('.monko.ts'));
    });
  });
});
