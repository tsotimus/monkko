# @monko/cli-testing

A comprehensive testing framework for validating Monko CLI code generation. This package implements a hybrid validation approach combining golden files, schema rule validation, and pattern matching.

## Features

### 🔍 **Hybrid Validation Approach**
- **Golden Files**: Compare generated output with known-good reference files
- **Schema Rules**: Programmatically validate field mappings and type correctness  
- **Pattern Matching**: Check for specific features like timestamps, imports, and exports

### 📋 **Test Suite Configuration**
- JSON-based test case definitions
- Easily extensible for new schema files
- Detailed validation rules per schema

### 🎯 **Validation Types**
- **File Existence**: Ensure expected files are generated
- **Content Structure**: Validate TypeScript type definitions
- **Field Mappings**: Check required/optional field mappings
- **Import Statements**: Verify necessary imports are present
- **Type Exports**: Confirm expected type exports exist

## Usage

### 1. Define Test Cases

Create a `test-suite.json` file with your test cases:

```json
{
  "cases": [
    {
      "name": "example_schema",
      "schemaFile": "test/example.monko.ts",
      "expectedTypeFiles": [
        "generated/User.types.ts",
        "generated/Post.types.ts"
      ],
      "description": "Test generation from example schema",
      "validationRules": {
        "User": {
          "fields": {
            "name": { "type": "string", "required": true },
            "email": { "type": "string", "required": true },
            "age": { "type": "number", "required": false }
          },
          "hasTimestamps": true,
          "expectedTypes": ["UserDocument", "CreateUserInput", "UpdateUserInput"],
          "requiredImports": ["import type { ObjectId } from 'mongodb';"]
        }
      }
    }
  ]
}
```

### 2. Run Validation

```go
package main

import (
    "github.com/monko/kit/cli-testing/pkg/validator"
)

func main() {
    // Load test suite
    suite, err := validator.LoadTestSuite("test-suite.json")
    if err != nil {
        log.Fatal(err)
    }

    // Run validation for each test case
    for _, testCase := range suite.Cases {
        // Generate types (your CLI logic)
        generatedFiles := generateTypes(testCase.SchemaFile)
        
        // Validate results
        result := validator.ValidateGeneratedTypes(testCase, generatedFiles, "testdata/golden")
        
        // Check results
        if !result.SchemaRulesValid {
            log.Printf("Schema validation failed: %v", result.Errors)
        }
        if !result.GoldenFileMatch {
            log.Printf("Golden file validation failed")
        }
    }
}
```

## Validation Rules

### Field Rules
```json
{
  "fieldName": {
    "type": "string|number|boolean|date|objectId",
    "required": true|false,
    "unique": true|false
  }
}
```

### Schema Rules
```json
{
  "fields": { /* field definitions */ },
  "hasTimestamps": true|false,
  "expectedTypes": ["TypeName1", "TypeName2"],
  "requiredImports": ["import statement 1", "import statement 2"]
}
```

## File Structure

```
packages/cli-testing/
├── pkg/
│   └── validator/
│       └── validator.go       # Core validation logic
├── testdata/
│   └── golden/               # Golden reference files
│       └── test_case_name/
│           ├── User.types.ts
│           └── Post.types.ts
├── test-suite.json          # Test case definitions
└── example-test-suite.json  # Example configuration
```

## Adding New Test Cases

1. Create your `.monko.ts` schema file in the `test/` directory
2. Add a new test case to `test-suite.json`
3. Define validation rules for each schema
4. Run tests to generate golden files (first run creates them)
5. Subsequent runs validate against golden files

## Golden File Management

Golden files are automatically created on first run if they don't exist. To update golden files:

1. Delete the existing golden file directory
2. Run tests again to regenerate

## Integration with Go Tests

Use this package in your CLI's Go tests:

```go
func TestGenerateIntegration(t *testing.T) {
    suite, err := validator.LoadTestSuite("test-suite.json")
    require.NoError(t, err)

    for _, testCase := range suite.Cases {
        t.Run(testCase.Name, func(t *testing.T) {
            // Your generation logic
            result := validator.ValidateGeneratedTypes(testCase, files, goldenDir)
            assert.True(t, result.SchemaRulesValid)
            assert.True(t, result.GoldenFileMatch)
        })
    }
}
``` 