package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"

	"github.com/spf13/cobra"
)

var generateCmd = &cobra.Command{
	Use:   "generate",
	Short: "Generate TypeScript types from Monko schemas",
	Long:  `Scans for *.monko.ts files and generates corresponding TypeScript types.`,
	RunE:  runGenerate,
}

type Schema struct {
	Name       string           `json:"name"`
	DB         string           `json:"db"`
	Collection string           `json:"collection"`
	Fields     map[string]Field `json:"fields"`
	Options    Options          `json:"options"`
}

type Field struct {
	Type     string `json:"type"`
	Required bool   `json:"required"`
	Unique   bool   `json:"unique"`
	Optional bool   `json:"optional"`
}

type Options struct {
	Timestamps bool `json:"timestamps"`
}

func runGenerate(cmd *cobra.Command, args []string) error {
	fmt.Println("🚀 Generating TypeScript types from Monko schemas...")

	// Step 1: Find all .monko.ts files
	schemaFiles, err := findSchemaFiles()
	if err != nil {
		return fmt.Errorf("failed to find schema files: %w", err)
	}

	if len(schemaFiles) == 0 {
		fmt.Println("⚠️  No .monko.ts files found")
		return nil
	}

	fmt.Printf("📄 Found %d schema file(s)\n", len(schemaFiles))

	// Step 2: Extract schemas using Node.js
	schemas, err := extractSchemas(schemaFiles)
	if err != nil {
		return fmt.Errorf("failed to extract schemas: %w", err)
	}

	// Step 3: Generate TypeScript types
	err = generateTypes(schemas)
	if err != nil {
		return fmt.Errorf("failed to generate types: %w", err)
	}

	fmt.Printf("✅ Generated types for %d schema(s)\n", len(schemas))
	return nil
}

func findSchemaFiles() ([]string, error) {
	var files []string

	err := filepath.Walk(".", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if strings.HasSuffix(path, ".monko.ts") {
			files = append(files, path)
		}

		return nil
	})

	return files, err
}

func extractSchemas(files []string) ([]Schema, error) {
	// For now, return mock data - we'll implement Node.js extraction later
	mockSchema := Schema{
		Name:       "User",
		DB:         "myapp",
		Collection: "users",
		Fields: map[string]Field{
			"name":  {Type: "string", Required: true},
			"email": {Type: "string", Required: true, Unique: true},
			"age":   {Type: "number", Required: false},
		},
		Options: Options{Timestamps: true},
	}

	return []Schema{mockSchema}, nil
}

func generateTypes(schemas []Schema) error {
	// Create generated directory if it doesn't exist
	err := os.MkdirAll("generated", 0755)
	if err != nil {
		return err
	}

	// Generate types for each schema
	for _, schema := range schemas {
		content, err := generateTypeContent(schema)
		if err != nil {
			return fmt.Errorf("failed to generate content for %s: %w", schema.Name, err)
		}

		filename := fmt.Sprintf("generated/%s.types.ts", schema.Name)
		err = os.WriteFile(filename, []byte(content), 0644)
		if err != nil {
			return fmt.Errorf("failed to write file %s: %w", filename, err)
		}

		fmt.Printf("  📝 %s\n", filename)
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
