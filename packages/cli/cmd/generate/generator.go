package generate

import (
	"fmt"
	"os"
	"strings"
	"text/template"
)

func GenerateTypes(schemas []Schema, outputDir string, debug bool) error {
	if debug {
		fmt.Printf("🔧 Creating output directory: %s\n", outputDir)
	}

	// Create output directory if it doesn't exist
	err := os.MkdirAll(outputDir, 0755)
	if err != nil {
		return err
	}

	// Generate types for each schema
	for _, schema := range schemas {
		content, err := generateTypeContent(schema)
		if err != nil {
			return fmt.Errorf("failed to generate content for %s: %w", schema.Name, err)
		}

		filename := fmt.Sprintf("%s/%s.types.ts", outputDir, schema.Name)
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

func generateTypeContent(schema Schema) (string, error) {
	tmplContent := `import type { ObjectId } from 'mongodb';

export type {{.Name}}Document = {
  _id: ObjectId;{{range $fieldName, $field := .Fields}}
  {{$fieldName}}{{if not $field.Required}}?{{end}}: {{typeScriptType $field.Type}};{{end}}{{if .Options.Timestamps}}
  createdAt: Date;
  updatedAt: Date;{{end}}
}

export type Create{{.Name}}Input = Omit<{{.Name}}Document, '_id'{{if .Options.Timestamps}} | 'createdAt' | 'updatedAt'{{end}}>;

export type Update{{.Name}}Input = Partial<Create{{.Name}}Input>;
`

	tmpl := template.Must(template.New("typescript").Funcs(template.FuncMap{
		"typeScriptType": typeScriptType,
	}).Parse(tmplContent))

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
