package generate

import (
	"fmt"

	"github.com/spf13/cobra"
)

// Flag variables
var debugFlag bool

var Cmd = &cobra.Command{
	Use:   "generate",
	Short: "Generate Standard Schema validation functions from Monko schemas",
	Long:  `Scans for *.monko.ts files and generates corresponding Standard Schema validation functions.`,
	RunE:  runGenerate,
}

func init() {
	// Add the --debug flag
	Cmd.Flags().BoolVar(&debugFlag, "debug", false, "Enable debug output")
}

func runGenerate(cmd *cobra.Command, args []string) error {

	if debugFlag {
		fmt.Println("🐛 Debug mode enabled")
	}

	config, err := LoadConfig(debugFlag)
	if err != nil {
		return fmt.Errorf("failed to load config: %w", err)
	}

	if debugFlag {
		fmt.Printf("🐛 Config loaded: %+v\n", config)
	}

	schemaFiles, err := FindSchemaFiles(config, debugFlag)
	if err != nil {
		return fmt.Errorf("failed to find schema files: %w", err)
	}

	if len(schemaFiles) == 0 {
		fmt.Println("⚠️  No .monko.ts files found")
		return nil
	}

	if debugFlag {
		fmt.Printf("📄 Found %d schema file(s)\n", len(schemaFiles))
	}

	schemas, err := ExtractSchemas(schemaFiles, debugFlag)
	if err != nil {
		return fmt.Errorf("failed to extract schemas: %w", err)
	}

	if debugFlag {
		fmt.Printf("🐛 Extracted %d schemas\n", len(schemas))
	}

	err = GenerateTypes(schemas, config.OutputDir, debugFlag)
	if err != nil {
		return fmt.Errorf("failed to generate schemas: %w", err)
	}

	fmt.Printf("✅ Generated Standard Schema validation functions for %d schema(s)\n", len(schemas))
	return nil
}
