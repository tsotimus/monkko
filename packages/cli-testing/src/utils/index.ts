export { compareFile } from './compareFile';
export type { FileComparisonResult } from './compareFile';
export { compareAllFiles } from './compareAllFiles';
export { fileExists } from './fileExists';
export { getExpectedFiles } from './getExpectedFiles';
export { normalizeContent } from './normalizeContent';
export { expectFilesToMatch } from './expectFilesToMatch';
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