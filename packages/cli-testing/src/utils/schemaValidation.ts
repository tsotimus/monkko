/**
 * Schema validation utilities for testing generated schema files
 */

export interface SchemaValidationResult {
  hasDefineSchemaImport: boolean;
  hasFieldsImport: boolean;
  schemaNames: string[];
  expectedSchemaName: string;
  hasMatchingSchemaName: boolean;
}

export interface SchemaStructureViolation {
  file: string;
  schema: string;
  missing: string[];
}

export interface SchemaNameViolation {
  file: string;
  expected: string;
  actual: string[];
}

export interface MissingImportViolation {
  file: string;
  missing: string[];
}

/**
 * Extract schema names from file content using regex
 */
export function extractSchemaNames(fileContent: string): string[] {
  const schemaNames: string[] = [];
  const schemaRegex = /export\s+const\s+(\w+)\s*=\s*defineSchema\s*\(\s*\{\s*name:\s*["'](\w+)["']/g;
  let match;
  
  while ((match = schemaRegex.exec(fileContent)) !== null) {
    if (match[2]) {
      schemaNames.push(match[2]); // The name property value
    }
  }
  
  return schemaNames;
}

/**
 * Validate a schema file for required patterns and structure
 */
export function validateSchemaFile(fileContent: string, fileName: string): SchemaValidationResult {
  const baseName = fileName.replace('.monkko.ts', '');
  const expectedSchemaName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  
  // Check if defineSchema is imported
  const hasDefineSchemaImport = /import\s*\{[^}]*defineSchema[^}]*\}\s*from\s*["']@monkko\/orm["']/.test(fileContent);
  
  // Check if fields is imported
  const hasFieldsImport = /import\s*\{[^}]*fields[^}]*\}\s*from\s*["']@monkko\/orm["']/.test(fileContent);
  
  // Extract schema names
  const schemaNames = extractSchemaNames(fileContent);
  
  return {
    hasDefineSchemaImport,
    hasFieldsImport,
    schemaNames,
    expectedSchemaName,
    hasMatchingSchemaName: schemaNames.includes(expectedSchemaName)
  };
}

/**
 * Validate schema structure and required properties
 */
export function validateSchemaStructure(fileContent: string, fileName: string): SchemaStructureViolation[] {
  const violations: SchemaStructureViolation[] = [];
  
  // Find all defineSchema calls and check for required properties
  const defineSchemaRegex = /export\s+const\s+(\w+)\s*=\s*defineSchema\s*\(\s*\{([^}]+)\}\s*\)/g;
  let match;
  
  while ((match = defineSchemaRegex.exec(fileContent)) !== null) {
    const schemaName = match[1];
    const schemaContent = match[2];
    
    if (schemaName && schemaContent) {
      const missing: string[] = [];
      if (!/name:\s*["']\w+["']/.test(schemaContent)) missing.push('name');
      if (!/db:\s*["']\w+["']/.test(schemaContent)) missing.push('db');
      if (!/collection:\s*["']\w+["']/.test(schemaContent)) missing.push('collection');
      if (!/fields:\s*\{/.test(schemaContent)) missing.push('fields');
      
      if (missing.length > 0) {
        violations.push({ file: fileName, schema: schemaName, missing });
      }
    }
  }
  
  return violations;
}

/**
 * Check for missing imports in a schema file
 */
export function validateSchemaImports(fileContent: string, fileName: string): MissingImportViolation | null {
  const validation = validateSchemaFile(fileContent, fileName);
  
  const missing: string[] = [];
  if (!validation.hasDefineSchemaImport) missing.push('defineSchema');
  if (!validation.hasFieldsImport) missing.push('fields');
  
  return missing.length > 0 ? { file: fileName, missing } : null;
} 