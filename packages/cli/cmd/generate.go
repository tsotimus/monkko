package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
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

type Config struct {
	OutputDir string   `json:"outputDir"`
	Includes  []string `json:"includes,omitempty"`
	Excludes  []string `json:"excludes,omitempty"`
}

func runGenerate(cmd *cobra.Command, args []string) error {
	fmt.Println("🚀 Generating TypeScript types from Monko schemas...")

	// Step 1: Load config
	config, err := loadConfig()
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	// Step 2: Find all .monko.ts files
	schemaFiles, err := findSchemaFiles(config)
	if err != nil {
		return fmt.Errorf("failed to find schema files: %w", err)
	}

	if len(schemaFiles) == 0 {
		fmt.Println("⚠️  No .monko.ts files found")
		return nil
	}

	fmt.Printf("📄 Found %d schema file(s)\n", len(schemaFiles))

	// Step 3: Extract schemas using Node.js
	schemas, err := extractSchemas(schemaFiles)
	if err != nil {
		return fmt.Errorf("failed to extract schemas: %w", err)
	}

	// Step 4: Generate TypeScript types
	err = generateTypes(schemas, config.OutputDir)
	if err != nil {
		return fmt.Errorf("failed to generate types: %w", err)
	}

	fmt.Printf("✅ Generated types for %d schema(s)\n", len(schemas))
	return nil
}

func loadConfig() (*Config, error) {
	// Default config (fallback if no config file)
	config := &Config{
		OutputDir: "generated", // Fallback if no config file
	}

	// Try to load monko.config.json
	if _, err := os.Stat("monko.config.json"); err == nil {
		fmt.Println("📝 Loading monko.config.json...")

		data, err := os.ReadFile("monko.config.json")
		if err != nil {
			return nil, fmt.Errorf("failed to read monko.config.json: %w", err)
		}

		var userConfig Config
		if err := json.Unmarshal(data, &userConfig); err != nil {
			return nil, fmt.Errorf("failed to parse monko.config.json: %w", err)
		}

		// Merge user config with defaults
		if userConfig.OutputDir != "" {
			config.OutputDir = userConfig.OutputDir
		}
		if userConfig.Includes != nil {
			config.Includes = userConfig.Includes
		}
		if userConfig.Excludes != nil {
			config.Excludes = userConfig.Excludes
		}
	} else {
		fmt.Println("💡 No monko.config.json found. Run '@monko/cli init' to create one.")
	}

	return config, nil
}

func findSchemaFiles(config *Config) ([]string, error) {
	var files []string

	// Determine search paths
	searchPaths := config.Includes
	if len(searchPaths) == 0 {
		searchPaths = []string{"."} // Default to current directory
	}

	for _, searchPath := range searchPaths {
		err := filepath.Walk(searchPath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			// Check excludes
			for _, exclude := range config.Excludes {
				if matched, _ := filepath.Match(exclude, path); matched {
					if info.IsDir() {
						return filepath.SkipDir
					}
					return nil
				}
			}

			if strings.HasSuffix(path, ".monko.ts") {
				files = append(files, path)
			}

			return nil
		})

		if err != nil {
			return nil, err
		}
	}

	return files, nil
}

func extractSchemas(files []string) ([]Schema, error) {
	if len(files) == 0 {
		return []Schema{}, nil
	}

	// Prepare the command to call Node.js extractor
	args := append([]string{"scripts/extract-schemas.js"}, files...)
	cmd := exec.Command("node", args...)

	// Run the command and capture output
	output, err := cmd.Output()
	if err != nil {
		// Check if it's an ExitError to get stderr
		if exitError, ok := err.(*exec.ExitError); ok {
			return nil, fmt.Errorf("schema extraction failed: %s\nStderr: %s", err, string(exitError.Stderr))
		}
		return nil, fmt.Errorf("failed to run schema extractor: %w", err)
	}

	// Parse the JSON output
	var result struct {
		Schemas     []Schema `json:"schemas"`
		ExtractedAt string   `json:"extractedAt"`
		Files       []string `json:"files"`
	}

	err = json.Unmarshal(output, &result)
	if err != nil {
		return nil, fmt.Errorf("failed to parse extracted schemas: %w\nOutput: %s", err, string(output))
	}

	fmt.Printf("📋 Extracted %d schema(s) from %d file(s)\n", len(result.Schemas), len(result.Files))

	return result.Schemas, nil
}

func generateTypes(schemas []Schema, outputDir string) error {
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
