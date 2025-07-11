package generate

import (
	_ "embed"
	"fmt"
	"os"
	"strings"
	"text/template"
)

//go:embed templates/schema.tmpl
var schemaTemplate string

func GenerateTypes(schemas []Schema, outputDir string, debug bool) error {
	if debug {
		fmt.Printf("🔧 Creating output directory: %s\n", outputDir)
	}

	// Create output directory if it doesn't exist
	err := os.MkdirAll(outputDir, 0755)
	if err != nil {
		return err
	}

	// Generate schemas for each schema
	for _, schema := range schemas {
		content, err := generateSchemaContent(schema)
		if err != nil {
			return fmt.Errorf("failed to generate content for %s: %w", schema.Name, err)
		}

		filename := fmt.Sprintf("%s/%s.schema.ts", outputDir, schema.Name)
		err = os.WriteFile(filename, []byte(content), 0644)
		if err != nil {
			return fmt.Errorf("failed to write file %s: %w", filename, err)
		}

		if debug {
			fmt.Printf("  📝 %s\n", filename)
		}
	}

	return nil
}

func generateSchemaContent(schema Schema) (string, error) {
	tmpl := template.Must(template.New("schema").Funcs(template.FuncMap{
		"typeScriptType":    typeScriptType,
		"generateValidator": generateValidator,
		"printf":            fmt.Sprintf,
	}).Parse(schemaTemplate))

	var result strings.Builder
	err := tmpl.Execute(&result, schema)
	if err != nil {
		return "", err
	}

	return result.String(), nil
}

func typeScriptType(schemaType string) string {
	switch schemaType {
	case "string":
		return "string"
	case "number":
		return "number"
	case "boolean":
		return "boolean"
	case "date":
		return "Date"
	case "objectId":
		return "ObjectId"
	default:
		return "any"
	}
}

func generateValidator(schemaType string, valueExpr string) string {
	switch schemaType {
	case "string":
		return fmt.Sprintf("typeof %s === 'string'", valueExpr)
	case "number":
		return fmt.Sprintf("typeof %s === 'number'", valueExpr)
	case "boolean":
		return fmt.Sprintf("typeof %s === 'boolean'", valueExpr)
	case "date":
		return fmt.Sprintf("%s instanceof Date", valueExpr)
	case "objectId":
		// For ObjectId, we need to check if it's an object with the right structure
		// MongoDB ObjectId can be string or actual ObjectId object
		return fmt.Sprintf("(typeof %s === 'string' && %s.length === 24) || (typeof %s === 'object' && %s !== null)", valueExpr, valueExpr, valueExpr, valueExpr)
	default:
		return "true" // fallback for unknown types
	}
}
