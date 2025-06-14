package generate

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/dop251/goja"
	"github.com/dop251/goja/ast"
	"github.com/dop251/goja/parser"
	"github.com/evanw/esbuild/pkg/api"
)

// ParseSchemaFiles iterates through files and extracts schemas.
func ParseSchemaFiles(files []string) ([]Schema, error) {
	fmt.Println("🔎 Starting schema parsing...")
	var allSchemas []Schema

	for _, file := range files {
		fmt.Printf("📄 Parsing file: %s\n", file)
		schemas, err := parseSchemaFile(file)
		if err != nil {
			// Provide context for the error
			return nil, fmt.Errorf("error parsing schemas from %s: %w", file, err)
		}
		allSchemas = append(allSchemas, schemas...)
	}

	fmt.Println("✅ Finished schema parsing.")
	return allSchemas, nil
}

// parseSchemaFile uses esbuild to transform TS to JS, then goja to parse and inspect the AST.
func parseSchemaFile(filename string) ([]Schema, error) {
	sourceCode, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}
	fmt.Printf("... Read %d bytes from %s\n", len(sourceCode), filename)

	// Step 1: Use esbuild's Transform API to convert TypeScript to JavaScript
	result := api.Transform(string(sourceCode), api.TransformOptions{
		Sourcefile: filename,
		Loader:     api.LoaderTS,
		Format:     api.FormatCommonJS,
	})

	// esbuild's Go API panics on error, so we check the Errors slice.
	if len(result.Errors) > 0 {
		firstError := result.Errors[0]
		return nil, fmt.Errorf("esbuild transform failed: %s at %s:%d:%d", firstError.Text, firstError.Location.File, firstError.Location.Line, firstError.Location.Column)
	}

	jsCode := string(result.Code)

	// Step 2: Parse the JavaScript code into an AST using goja's parser
	program, err := parser.ParseFile(nil, "", jsCode, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to parse javascript: %w", err)
	}

	// Step 3: Walk the AST to find 'defineSchema' calls
	return findSchemasInAST(program, jsCode)
}

func findSchemasInAST(program *ast.Program, jsCode string) ([]Schema, error) {
	var schemas []Schema
	vm := goja.New()

	// processNode is a helper to reduce duplication. It extracts the schema
	// details once a defineSchema call is identified.
	processNode := func(varName, callee *ast.Identifier, callExpr *ast.CallExpression) error {
		if callee.Name.String() != "defineSchema" {
			return nil // Not the function we're looking for
		}

		fmt.Printf("... Found schema variable: %s\n", varName.Name.String())

		if len(callExpr.ArgumentList) != 1 {
			return nil // Skip if defineSchema doesn't have exactly one argument
		}
		schemaObjNode := callExpr.ArgumentList[0]

		start := schemaObjNode.Idx0()
		end := schemaObjNode.Idx1()
		schemaObjectStr := jsCode[start:end]

		v, err := vm.RunString("(" + schemaObjectStr + ")")
		if err != nil {
			return fmt.Errorf("failed to execute schema object for '%s': %w", varName.Name.String(), err)
		}

		schemaMap := v.Export()
		if schemaMap == nil {
			return fmt.Errorf("failed to export schema object for '%s' to map", varName.Name.String())
		}

		schema, err := mapToSchema(varName.Name.String(), schemaMap.(map[string]interface{}))
		if err != nil {
			return fmt.Errorf("failed to process schema for '%s': %w", varName.Name.String(), err)
		}
		schemas = append(schemas, schema)
		return nil
	}

	for _, stmt := range program.Body {
		var err error

		// Case 1: Handle `const mySchema = defineSchema(...)`
		if varStmt, ok := stmt.(*ast.VariableStatement); ok {
			for _, binding := range varStmt.List {
				if binding.Initializer == nil {
					continue
				}

				if varName, ok := binding.Target.(*ast.Identifier); ok {
					if callExpr, ok := binding.Initializer.(*ast.CallExpression); ok {
						if callee, ok := callExpr.Callee.(*ast.Identifier); ok {
							err = processNode(varName, callee, callExpr)
						}
					}
				}
			}
		}

		// Case 2: Handle `exports.mySchema = defineSchema(...)` (from CommonJS)
		if exprStmt, ok := stmt.(*ast.ExpressionStatement); ok {
			if assignExpr, ok := exprStmt.Expression.(*ast.AssignExpression); ok {
				if dotExpr, ok := assignExpr.Left.(*ast.DotExpression); ok {
					if exports, ok := dotExpr.Left.(*ast.Identifier); ok && exports.Name.String() == "exports" {
						if callExpr, ok := assignExpr.Right.(*ast.CallExpression); ok {
							if callee, ok := callExpr.Callee.(*ast.Identifier); ok {
								err = processNode(&dotExpr.Identifier, callee, callExpr)
							}
						}
					}
				}
			}
		}

		if err != nil {
			return nil, err
		}
	}
	return schemas, nil
}

// mapToSchema converts a map[string]interface{} from goja into our typed Schema struct.
func mapToSchema(varName string, schemaMap map[string]interface{}) (Schema, error) {
	fmt.Printf("...... Parsing config for schema: %s\n", varName)

	// Set default values
	schema := Schema{
		Name:       varName,
		Collection: strings.ToLower(varName),
		Fields:     make(map[string]Field),
	}

	// Extract top-level properties
	if name, ok := schemaMap["name"].(string); ok {
		schema.Name = name
	}
	if db, ok := schemaMap["db"].(string); ok {
		schema.DB = db
	}
	if collection, ok := schemaMap["collection"].(string); ok {
		schema.Collection = collection
	}
	fmt.Printf("......... Name: %s, DB: %s, Collection: %s\n", schema.Name, schema.DB, schema.Collection)

	// Extract fields
	if fieldsMap, ok := schemaMap["fields"].(map[string]interface{}); ok {
		fmt.Println("......... Found fields object. Parsing fields...")
		fields := make(map[string]Field)
		for fieldName, fieldVal := range fieldsMap {
			fieldObj, ok := fieldVal.(map[string]interface{})
			if !ok {
				continue
			}
			field := Field{}
			if fType, ok := fieldObj["type"].(string); ok {
				field.Type = fType
			}
			if required, ok := fieldObj["required"].(bool); ok {
				field.Required = required
			}
			if unique, ok := fieldObj["unique"].(bool); ok {
				field.Unique = unique
			}
			if optional, ok := fieldObj["optional"].(bool); ok {
				field.Optional = optional
			}
			fmt.Printf("............... Found field: %s, Type: %s\n", fieldName, field.Type)
			fields[fieldName] = field
		}
		schema.Fields = fields
	}

	// Extract options
	if optionsMap, ok := schemaMap["options"].(map[string]interface{}); ok {
		fmt.Println("......... Found options object. Parsing options...")
		options := Options{}
		if timestamps, ok := optionsMap["timestamps"].(bool); ok {
			options.Timestamps = timestamps
			fmt.Printf("............... Found timestamps: %t\n", timestamps)
		}
		schema.Options = options
	}

	return schema, nil
}

// A simple utility to pretty-print schemas as JSON for debugging
func (s Schema) ToJSON() string {
	b, err := json.MarshalIndent(s, "", "  ")
	if err != nil {
		return ""
	}
	return string(b)
}
