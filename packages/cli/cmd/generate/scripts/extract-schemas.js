#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

/**
 * Extract schemas from .monko.ts files using TypeScript compiler API
 * This provides proper parsing, type checking, and error handling
 */

function extractSchemasFromFiles(files, options = {}) {
  const schemas = [];
  const errors = [];
  
  // Optionally run TypeScript type checking first
  if (options.typecheck !== false) {
    const typeErrors = checkTypes(files);
    if (typeErrors.length > 0) {
      console.error('❌ TypeScript errors found:');
      typeErrors.forEach(error => console.error(`  ${error}`));
      if (!options.ignoreTypeErrors) {
        process.exit(1);
      }
    }
  }
  
  for (const file of files) {
    try {
      const fileSchemas = parseSchemaFile(file);
      schemas.push(...fileSchemas);
    } catch (error) {
      errors.push(`Error parsing ${file}: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    errors.forEach(error => console.error(error));
    process.exit(1);
  }
  
  return schemas;
}

function checkTypes(files) {
  const errors = [];
  
  // Create a basic TypeScript program for type checking
  const compilerOptions = {
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    skipLibCheck: true,
    noEmit: true,
    allowJs: false,
    strict: false, // Be lenient for schema files
  };
  
  try {
    const program = ts.createProgram(files, compilerOptions);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    
    diagnostics.forEach(diagnostic => {
      if (diagnostic.file) {
        const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        errors.push(`${diagnostic.file.fileName}(${line + 1},${character + 1}): ${message}`);
      } else {
        errors.push(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      }
    });
  } catch (error) {
    // Type checking failed, but we can still try to parse
    console.warn('⚠️  TypeScript type checking failed, continuing with parsing...');
  }
  
  return errors;
}

function parseSchemaFile(filename) {
  // Read the file
  const sourceCode = fs.readFileSync(filename, 'utf8');
  
  // Create a TypeScript source file
  const sourceFile = ts.createSourceFile(
    filename,
    sourceCode,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  
  const schemas = [];
  
  // Walk the AST to find defineSchema calls
  function visit(node) {
    // Look for: export const SomeName = defineSchema(...)
    if (ts.isVariableStatement(node) && 
        node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      
      const declaration = node.declarationList.declarations[0];
      if (declaration && 
          ts.isVariableDeclaration(declaration) &&
          declaration.initializer &&
          ts.isCallExpression(declaration.initializer)) {
        
        const callExpr = declaration.initializer;
        
        // Check if it's a defineSchema call
        if (ts.isIdentifier(callExpr.expression) && 
            callExpr.expression.text === 'defineSchema') {
          
          const variableName = declaration.name.getText(sourceFile);
          const configArg = callExpr.arguments[0];
          
          if (configArg && ts.isObjectLiteralExpression(configArg)) {
            try {
              const schema = parseSchemaFromObjectLiteral(configArg, variableName, sourceFile);
              schemas.push(schema);
            } catch (error) {
              throw new Error(`Error parsing schema ${variableName}: ${error.message}`);
            }
          }
        }
      }
    }
    
    ts.forEachChild(node, visit);
  }
  
  visit(sourceFile);
  return schemas;
}

function parseSchemaFromObjectLiteral(objectLiteral, variableName, sourceFile) {
  const schema = {
    name: variableName,
    db: 'default',
    collection: variableName.toLowerCase(),
    fields: {},
    options: {}
  };
  
  // Parse each property in the schema object
  for (const property of objectLiteral.properties) {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
      const propertyName = property.name.text;
      const value = property.initializer;
      
      switch (propertyName) {
        case 'name':
          if (ts.isStringLiteral(value)) {
            schema.name = value.text;
          }
          break;
          
        case 'db':
          if (ts.isStringLiteral(value)) {
            schema.db = value.text;
          }
          break;
          
        case 'collection':
          if (ts.isStringLiteral(value)) {
            schema.collection = value.text;
          }
          break;
          
        case 'fields':
          if (ts.isObjectLiteralExpression(value)) {
            schema.fields = parseFields(value, sourceFile);
          }
          break;
          
        case 'options':
          if (ts.isObjectLiteralExpression(value)) {
            schema.options = parseOptions(value, sourceFile);
          }
          break;
      }
    }
  }
  
  return schema;
}

function parseFields(fieldsObject, sourceFile) {
  const fields = {};
  
  for (const property of fieldsObject.properties) {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
      const fieldName = property.name.text;
      const fieldValue = property.initializer;
      
      // Look for fields.type({ options }) pattern
      if (ts.isCallExpression(fieldValue) && 
          ts.isPropertyAccessExpression(fieldValue.expression)) {
        
        const accessExpr = fieldValue.expression;
        if (ts.isIdentifier(accessExpr.expression) && 
            accessExpr.expression.text === 'fields' &&
            ts.isIdentifier(accessExpr.name)) {
          
          const fieldType = accessExpr.name.text;
          const options = parseFieldOptions(fieldValue.arguments[0], sourceFile);
          
          fields[fieldName] = {
            type: fieldType,
            ...options
          };
        }
      }
    }
  }
  
  return fields;
}

function parseFieldOptions(optionsArg, sourceFile) {
  const options = {
    required: false,
    unique: false,
    optional: false
  };
  
  if (optionsArg && ts.isObjectLiteralExpression(optionsArg)) {
    for (const property of optionsArg.properties) {
      if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
        const optionName = property.name.text;
        const optionValue = property.initializer;
        
        if (optionName === 'required' && 
            (optionValue.kind === ts.SyntaxKind.TrueKeyword || 
             optionValue.kind === ts.SyntaxKind.FalseKeyword)) {
          options.required = optionValue.kind === ts.SyntaxKind.TrueKeyword;
        }
        
        if (optionName === 'unique' && 
            (optionValue.kind === ts.SyntaxKind.TrueKeyword || 
             optionValue.kind === ts.SyntaxKind.FalseKeyword)) {
          options.unique = optionValue.kind === ts.SyntaxKind.TrueKeyword;
        }
        
        if (optionName === 'optional' && 
            (optionValue.kind === ts.SyntaxKind.TrueKeyword || 
             optionValue.kind === ts.SyntaxKind.FalseKeyword)) {
          options.optional = optionValue.kind === ts.SyntaxKind.TrueKeyword;
        }
      }
    }
  }
  
  return options;
}

function parseOptions(optionsObject, sourceFile) {
  const options = {};
  
  for (const property of optionsObject.properties) {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
      const optionName = property.name.text;
      const optionValue = property.initializer;
      
      if (optionName === 'timestamps' && 
          (optionValue.kind === ts.SyntaxKind.TrueKeyword || 
           optionValue.kind === ts.SyntaxKind.FalseKeyword)) {
        options.timestamps = optionValue.kind === ts.SyntaxKind.TrueKeyword;
      }
    }
  }
  
  return options;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  // Parse command line options
  const options = {
    typecheck: true,
    ignoreTypeErrors: false
  };
  
  const files = [];
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--no-typecheck') {
      options.typecheck = false;
    } else if (arg === '--ignore-type-errors') {
      options.ignoreTypeErrors = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: node extract-schemas.js [options] <file1.monko.ts> [file2.monko.ts] ...

Options:
  --no-typecheck         Skip TypeScript type checking
  --ignore-type-errors   Continue even if type errors are found
  --help, -h            Show this help message

Examples:
  node extract-schemas.js schema.monko.ts
  node extract-schemas.js --no-typecheck *.monko.ts
  node extract-schemas.js --ignore-type-errors schema1.monko.ts schema2.monko.ts
      `);
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      files.push(arg);
    }
  }
  
  if (files.length === 0) {
    console.error('Usage: node extract-schemas.js [options] <file1.monko.ts> [file2.monko.ts] ...');
    console.error('Run with --help for more information.');
    process.exit(1);
  }
  
  // Validate all files exist
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      process.exit(1);
    }
  }
  
  // Extract schemas
  const schemas = extractSchemasFromFiles(files, options);
  
  // Output as JSON
  const result = {
    schemas: schemas,
    extractedAt: new Date().toISOString(),
    files: files
  };
  
  console.log(JSON.stringify(result, null, 2));
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  extractSchemasFromFiles,
  parseSchemaFile
}; 