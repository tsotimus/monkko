package generate

import (
	"fmt"
)

// ExtractSchemas extracts schemas from .monko.ts files using pure Go implementation
func ExtractSchemas(files []string) ([]Schema, error) {
	if len(files) == 0 {
		return []Schema{}, nil
	}

	// Use the new Go-based parser
	schemas, err := ParseSchemaFiles(files)
	if err != nil {
		return nil, fmt.Errorf("failed to extract schemas: %w", err)
	}

	fmt.Printf("📋 Extracted %d schema(s) from %d file(s)\n", len(schemas), len(files))

	return schemas, nil
}

// getEmbeddedScript returns the embedded Node.js script
// This function will be implemented to access the script from the main package
func getEmbeddedScript() string {
	// This will be implemented to access the embedded script
	// For now, we'll need to import it from the main package
	return ""
}
