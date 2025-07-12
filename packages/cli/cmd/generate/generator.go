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

//go:embed templates/utils.tmpl
var utilsTemplate string

func GenerateTypes(schemas []Schema, outputDir string, debug bool) error {
	if debug {
		fmt.Printf("🔧 Creating output directory: %s\n", outputDir)
	}

	// Create output directory if it doesn't exist
	err := os.MkdirAll(outputDir, 0755)
	if err != nil {
		return err
	}

	// Check if any schema uses ObjectId type
	needsUtils := false
	for _, schema := range schemas {
		if hasObjectIdField(schema) {
			needsUtils = true
			break
		}
	}

	// Generate utils file if needed
	if needsUtils {
		err := generateUtilsFile(outputDir, debug)
		if err != nil {
			return fmt.Errorf("failed to generate utils file: %w", err)
		}
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
		"zodType": zodType,
		"printf":  fmt.Sprintf,
	}).Parse(schemaTemplate))

	var result strings.Builder
	err := tmpl.Execute(&result, schema)
	if err != nil {
		return "", err
	}

	return result.String(), nil
}

func zodType(schemaType string, required bool) string {
	var zodSchema string

	switch schemaType {
	case "string":
		zodSchema = "z.string()"
	case "number":
		zodSchema = "z.number()"
	case "boolean":
		zodSchema = "z.boolean()"
	case "date":
		zodSchema = "z.date()"
	case "objectId":
		zodSchema = "ObjectIdSchema"
	default:
		zodSchema = "z.any()"
	}

	if !required {
		zodSchema += ".optional()"
	}

	return zodSchema
}

// hasObjectIdField checks if a schema has any fields with ObjectId type
func hasObjectIdField(schema Schema) bool {
	for _, field := range schema.Fields {
		if field.Type == "objectId" {
			return true
		}
	}
	return false
}

// generateUtilsFile generates the shared utils file with ObjectIdSchema
func generateUtilsFile(outputDir string, debug bool) error {
	filename := fmt.Sprintf("%s/utils.ts", outputDir)

	err := os.WriteFile(filename, []byte(utilsTemplate), 0644)
	if err != nil {
		return fmt.Errorf("failed to write utils file %s: %w", filename, err)
	}

	if debug {
		fmt.Printf("  📝 %s\n", filename)
	}

	return nil
}

// Note: Removed typeScriptType() and generateValidator() functions
// as they are no longer needed with Zod schema generation
