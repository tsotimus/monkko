// Check if the generated files exist and have the correct name

import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validateSchemaFile } from '@/utils';

describe('File Pattern Tests', () => {
  // Get all schema files dynamically
  const schemasDir = join(process.cwd(), 'src/schemas');
  const schemaFiles = readdirSync(schemasDir).filter(file => file.endsWith('.monko.ts'));
  
  // Generate a test for each schema file
  schemaFiles.forEach(fileName => {
    const baseName = fileName.replace('.monko.ts', '');
    const expectedSchemaName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    
    it(`should have schema name matching file name for ${fileName}`, () => {
      const filePath = join(schemasDir, fileName);
      const fileContent = readFileSync(filePath, 'utf-8');
      const validation = validateSchemaFile(fileContent, fileName);
      
      expect(validation.hasMatchingSchemaName).toBe(true);
      expect(validation.schemaNames).toContain(expectedSchemaName);
    });
  });

  // Add a safety test to ensure we're actually testing files
  it('should have at least one schema file to test', () => {
    expect(schemaFiles.length).toBeGreaterThan(0);
  });
});