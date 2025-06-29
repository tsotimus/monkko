export { compareFile } from './compareFile';
export type { FileComparisonResult } from './compareFile';
export { normalizeContent } from './normalizeContent';
export { 
  extractSchemaNames, 
  validateSchemaFile, 
  validateSchemaStructure, 
  validateSchemaImports 
} from './schemaValidation';

export type { 
  SchemaValidationResult, 
  SchemaStructureViolation, 
  SchemaNameViolation, 
  MissingImportViolation 
} from './schemaValidation'; 