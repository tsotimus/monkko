package generate

import (
	"fmt"

	"github.com/spf13/cobra"
)

var Cmd = &cobra.Command{
	Use:   "generate",
	Short: "Generate TypeScript types from Monko schemas",
	Long:  `Scans for *.monko.ts files and generates corresponding TypeScript types.`,
	RunE:  runGenerate,
}

func runGenerate(cmd *cobra.Command, args []string) error {
	fmt.Println("🚀 Generating TypeScript types from Monko schemas...")

	// Step 1: Load config
	config, err := LoadConfig()
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	// Step 2: Find all .monko.ts files
	schemaFiles, err := FindSchemaFiles(config)
	if err != nil {
		return fmt.Errorf("failed to find schema files: %w", err)
	}

	if len(schemaFiles) == 0 {
		fmt.Println("⚠️  No .monko.ts files found")
		return nil
	}

	fmt.Printf("📄 Found %d schema file(s)\n", len(schemaFiles))

	// Step 3: Extract schemas
	schemas, err := ExtractSchemas(schemaFiles)
	if err != nil {
		return fmt.Errorf("failed to extract schemas: %w", err)
	}

	// Step 4: Generate TypeScript types
	err = GenerateTypes(schemas, config.OutputDir)
	if err != nil {
		return fmt.Errorf("failed to generate types: %w", err)
	}

	fmt.Printf("✅ Generated types for %d schema(s)\n", len(schemas))
	return nil
}
