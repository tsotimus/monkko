package generate

import (
	"fmt"
	"os"
	"strings"

	"github.com/dop251/goja/ast"
	"github.com/dop251/goja/parser"
	"github.com/evanw/esbuild/pkg/api"
)

// ParseSchemaFiles iterates through files and extracts schemas.
func ParseSchemaFiles(files []string, debug bool) ([]Schema, error) {
	if debug {
		fmt.Println("🔎 Starting schema parsing...")
	}
	var allSchemas []Schema

	for _, file := range files {
		if debug {
			fmt.Printf("📄 Parsing file: %s\n", file)
		}
		schemas, err := parseSchemaFile(file, debug)
		if err != nil {
			// Provide context for the error
			return nil, fmt.Errorf("error parsing schemas from %s: %w", file, err)
		}
		allSchemas = append(allSchemas, schemas...)
	}

	if debug {
		fmt.Println("✅ Finished schema parsing.")
	}
	return allSchemas, nil
}

// parseSchemaFile uses esbuild to transform TS to JS, then goja to parse and inspect the AST.
func parseSchemaFile(filename string, debug bool) ([]Schema, error) {
	sourceCode, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}
	if debug {
		fmt.Printf("... Read %d bytes from %s\n", len(sourceCode), filename)
	}

	// Step 1: Use esbuild's Transform API to convert TypeScript to JavaScript
	result := api.Transform(string(sourceCode), api.TransformOptions{
		Sourcefile: filename,
		Loader:     api.LoaderTS,
		Format:     api.FormatCommonJS,
	})

	// esbuild's Go API panics on error, so we check the Errors slice.
	if len(result.Errors) > 0 {
		errorMessages := api.FormatMessages(result.Errors, api.FormatMessagesOptions{
			Kind:  api.ErrorMessage,
			Color: true,
		})
		// Each message is a formatted string, join them for a single print.
		fmt.Fprintln(os.Stderr, "❌ Esbuild transform failed with errors:")
		fmt.Fprint(os.Stderr, strings.Join(errorMessages, ""))
		os.Exit(1)
	}

	jsCode := string(result.Code)

	// fmt.Println(jsCode)

	// Step 2: Parse the JavaScript code into an AST using goja's parser
	program, err := parser.ParseFile(nil, "", jsCode, 0)
	if err != nil {
		return nil, fmt.Errorf("failed to parse javascript: %w", err)
	}

	// Step 3: Walk the AST to find 'defineSchema' calls
	return findSchemasInAST(program, jsCode, debug)
}

// getDefineSchemaCallee recursively traverses an expression to find the "defineSchema" identifier.
// It handles simple identifiers, dot expressions (e.g., `orm.defineSchema`), and sequence
// expressions (e.g., `(0, orm.defineSchema)`), which are common in transpiled code.
func getDefineSchemaCallee(expr ast.Expression) *ast.Identifier {
	switch e := expr.(type) {
	case *ast.Identifier:
		if e.Name.String() == "defineSchema" {
			return e
		}
	case *ast.DotExpression:
		if e.Identifier.Name.String() == "defineSchema" {
			return &e.Identifier
		}
	case *ast.SequenceExpression:
		if len(e.Sequence) > 0 {
			// The value of a sequence expression is its last expression.
			return getDefineSchemaCallee(e.Sequence[len(e.Sequence)-1])
		}
	}
	return nil
}

// processBindings abstracts the logic for finding defineSchema calls within
// a list of variable bindings, which is common to both VariableStatement
// and LexicalDeclaration.
func processBindings(bindings []*ast.Binding, calleeFn func(ast.Expression) *ast.Identifier, processFn func(*ast.Identifier, *ast.Identifier, *ast.CallExpression) error, debug bool) error {
	for _, binding := range bindings {
		if binding.Initializer == nil {
			continue
		}

		callExpr, ok := binding.Initializer.(*ast.CallExpression)
		if !ok {
			continue
		}

		callee := calleeFn(callExpr.Callee)
		if callee == nil {
			continue
		}

		if varName, ok := binding.Target.(*ast.Identifier); ok {
			if debug {
				fmt.Printf("... Analyzing call expression for variable: %s\n", varName.Name.String())
				fmt.Printf("... Callee is: %s\n", callee.Name.String())
			}
			if err := processFn(varName, callee, callExpr); err != nil {
				return err
			}
		}
	}
	return nil
}

func findSchemasInAST(program *ast.Program, jsCode string, debug bool) ([]Schema, error) {
	var schemas []Schema

	processNode := func(varName, callee *ast.Identifier, callExpr *ast.CallExpression) error {
		if callee.Name.String() != "defineSchema" {
			return nil
		}

		if debug {
			fmt.Printf("... Found schema variable: %s\n", varName.Name.String())
		}

		if len(callExpr.ArgumentList) != 1 {
			return fmt.Errorf("defineSchema expects exactly one argument for '%s'", varName.Name.String())
		}
		schemaObjNode, ok := callExpr.ArgumentList[0].(*ast.ObjectLiteral)
		if !ok {
			return fmt.Errorf("expected schema definition to be an object literal for '%s'", varName.Name.String())
		}

		// Convert AST object to map[string]interface{}
		schemaMapInterface, err := convertASTNodeToValue(schemaObjNode)
		if err != nil {
			return fmt.Errorf("error converting schema AST to map for '%s': %w", varName.Name.String(), err)
		}

		schemaMap, ok := schemaMapInterface.(map[string]interface{})
		if !ok {
			return fmt.Errorf("internal error: converted schema AST is not a map for '%s'", varName.Name.String())
		}

		// Use the existing mapToSchema function from maps.go
		schema, err := mapToSchema(varName.Name.String(), schemaMap, debug)
		if err != nil {
			return fmt.Errorf("error mapping schema for '%s': %w", varName.Name.String(), err)
		}

		schemas = append(schemas, schema)
		return nil
	}

	for _, stmt := range program.Body {
		var err error
		if varStmt, ok := stmt.(*ast.VariableStatement); ok {
			err = processBindings(varStmt.List, getDefineSchemaCallee, processNode, debug)
		}
		if lexDecl, ok := stmt.(*ast.LexicalDeclaration); ok {
			err = processBindings(lexDecl.List, getDefineSchemaCallee, processNode, debug)
		}
		if exprStmt, ok := stmt.(*ast.ExpressionStatement); ok {
			if assignExpr, ok := exprStmt.Expression.(*ast.AssignExpression); ok {
				if dotExpr, ok := assignExpr.Left.(*ast.DotExpression); ok {
					if exports, ok := dotExpr.Left.(*ast.Identifier); ok && exports.Name.String() == "exports" {
						if callExpr, ok := assignExpr.Right.(*ast.CallExpression); ok {
							if callee := getDefineSchemaCallee(callExpr.Callee); callee != nil {
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

// getKeyFromPropertyKeyed extracts the string key from a property in an AST object literal.
// It supports both identifiers (e.g., { name: ... }) and string literals (e.g., { "name": ... }).
func getKeyFromPropertyKeyed(prop *ast.PropertyKeyed) (string, error) {
	if keyIdent, ok := prop.Key.(*ast.Identifier); ok {
		return keyIdent.Name.String(), nil
	} else if keyStr, ok := prop.Key.(*ast.StringLiteral); ok {
		return keyStr.Value.String(), nil
	}
	return "", fmt.Errorf("unsupported property key type: %T", prop.Key)
}

// convertASTNodeToValue recursively converts an AST expression node into a Go interface{}.
// It handles literals, objects, and the special `fields.type()` call expressions
// to build a map that can be passed to the `mapToSchema` function.
func convertASTNodeToValue(node ast.Expression) (interface{}, error) {
	switch n := node.(type) {
	case *ast.StringLiteral:
		return n.Value.String(), nil
	case *ast.NumberLiteral:
		return n.Value, nil
	case *ast.BooleanLiteral:
		return n.Value, nil
	case *ast.NullLiteral:
		return nil, nil
	case *ast.ObjectLiteral:
		objMap := make(map[string]interface{})
		for _, propNode := range n.Value {
			prop, ok := propNode.(*ast.PropertyKeyed)
			if !ok {
				continue // Or handle other property types if needed
			}
			key, err := getKeyFromPropertyKeyed(prop)
			if err != nil {
				return nil, err
			}
			val, err := convertASTNodeToValue(prop.Value)
			if err != nil {
				return nil, err
			}
			objMap[key] = val
		}
		return objMap, nil
	case *ast.CallExpression:
		// Handle different types of call expressions
		switch callee := n.Callee.(type) {
		case *ast.DotExpression:
			// This is for handling field definitions like `fields.string({ required: true })`
			// The type is the identifier, e.g., "string" from "fields.string"
			fieldType := callee.Identifier.Name.String()

			var configMap map[string]interface{}
			// The arguments to the call are the field configs
			if len(n.ArgumentList) > 0 {
				if argObj, ok := n.ArgumentList[0].(*ast.ObjectLiteral); ok {
					val, err := convertASTNodeToValue(argObj)
					if err != nil {
						return nil, err
					}
					if val != nil {
						configMap, _ = val.(map[string]interface{})
					}
				}
			}
			if configMap == nil {
				configMap = make(map[string]interface{})
			}

			// Inject the "type" property, which mapToSchema expects
			configMap["type"] = fieldType

			return configMap, nil

		case *ast.Identifier:
			// This is for handling subdocument references like `Address({ optional: true })`
			subdocType := callee.Name.String()

			var configMap map[string]interface{}
			// The arguments to the call are the subdocument configs
			if len(n.ArgumentList) > 0 {
				if argObj, ok := n.ArgumentList[0].(*ast.ObjectLiteral); ok {
					val, err := convertASTNodeToValue(argObj)
					if err != nil {
						return nil, err
					}
					if val != nil {
						configMap, _ = val.(map[string]interface{})
					}
				}
			}
			if configMap == nil {
				configMap = make(map[string]interface{})
			}

			// Mark this as a subdocument type
			configMap["type"] = subdocType

			return configMap, nil

		default:
			return nil, fmt.Errorf("unsupported call expression callee type: %T", n.Callee)
		}
	default:
		return nil, fmt.Errorf("unsupported AST node type for conversion: %T", n)
	}
}
