package generate

import (
	"fmt"
)

// ExtractSchemas extracts schemas from .monko.ts files using pure Go implementation
func ExtractSchemas(files []string, debug bool) ([]Schema, error) {
	if len(files) == 0 {
		return []Schema{}, nil
	}

	// Use the new Go-based parser
	schemas, err := ParseSchemaFiles(files, debug)
	if err != nil {
		return nil, fmt.Errorf("failed to extract schemas: %w", err)
	}

	if debug {
		fmt.Printf("📋 Extracted %d schema(s) from %d file(s)\n", len(schemas), len(files))
	}

	return schemas, nil
}
