package generate

import (
	"encoding/json"
	"fmt"
	"os/exec"
)

func ExtractSchemas(files []string) ([]Schema, error) {
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
