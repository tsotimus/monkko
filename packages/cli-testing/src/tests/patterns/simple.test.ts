// Write some simple pattern tests. The patterns to look for are:
// - The schema name is the same as the file name
// - The schema is defined in the file
// - The schema has a collection name that is the same as the file name
// - The schema has a db name that is the same as the file name
// - The schema has a fields object

import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileExists } from '@/utils';

// Import all schemas to test
import * as productSchema from '@/schemas/product.monko';
import * as postSchema from '@/schemas/post.monko';

describe('Schema Pattern Tests', () => {
  describe('Schema name matches file name', () => {
    it('should have schema name matching file name for product.monko.ts', async () => {
      // File name: product.monko.ts -> expected schema name: "Product" 
      const fileName = 'product.monko.ts';
      const expectedSchemaName = 'Product';
      
      // Check if the schema name matches the file name pattern
      expect(productSchema.Product.name).toBe(expectedSchemaName);
    });

    it('should have schema name matching file name for post.monko.ts', async () => {
      // File name: post.monko.ts -> expected schema name: "Post"
      const fileName = 'post.monko.ts';
      const expectedPostSchemaName = 'Post';
      
      // Check if the Post schema name matches the file name pattern
      expect(postSchema.Post.name).toBe(expectedPostSchemaName);
      
      // Note: User schema is also in post.monko.ts but doesn't match the file name
      // This might be intentional or could be flagged as a pattern violation
    });

    it('should validate all schemas follow the file name pattern', async () => {
      // Get all schema files
      const schemasDir = join(process.cwd(), 'src/schemas');
      const schemaFiles = readdirSync(schemasDir).filter(file => file.endsWith('.monko.ts'));
      
      const violations: Array<{ file: string; expected: string; actual: string[] }> = [];
      
      for (const file of schemaFiles) {
        // Extract expected schema name from file name
        const baseName = file.replace('.monko.ts', '');
        const expectedSchemaName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        
        // Import the schema module dynamically
        const schemaModule = await import(`@/schemas/${file}`);
        const exportedSchemas = Object.keys(schemaModule);
        const actualSchemaNames = exportedSchemas.map(key => schemaModule[key]?.name).filter(Boolean);
        
        // Check if any schema in the file matches the expected name
        const hasMatchingSchema = actualSchemaNames.some(name => name === expectedSchemaName);
        
        if (!hasMatchingSchema) {
          violations.push({
            file,
            expected: expectedSchemaName,
            actual: actualSchemaNames
          });
        }
      }
      
      // Assert no violations
      if (violations.length > 0) {
        const violationMessages = violations.map(v => 
          `File "${v.file}" should contain schema named "${v.expected}" but found: [${v.actual.join(', ')}]`
        ).join('\n');
        
        throw new Error(`Schema name pattern violations:\n${violationMessages}`);
      }
      
      expect(violations).toHaveLength(0);
    });
  });
});
