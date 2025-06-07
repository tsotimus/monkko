package generate

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/monko/kit/cmd/generate/scripts"
)

func ExtractSchemas(files []string) ([]Schema, error) {
	if len(files) == 0 {
		return []Schema{}, nil
	}

	// Get the embedded script content from the scripts package
	scriptContent := scripts.ExtractSchemaScript

	// Create a temporary file for the Node.js script
	tmpDir, err := os.MkdirTemp("", "monko-cli-*")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tmpDir) // Clean up when done

	scriptPath := filepath.Join(tmpDir, "extract-schemas.js")
	err = os.WriteFile(scriptPath, []byte(scriptContent), 0755)
	if err != nil {
		return nil, fmt.Errorf("failed to write script to temp file: %w", err)
	}

	// Prepare the command to call Node.js extractor
	args := append([]string{scriptPath}, files...)
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

// getEmbeddedScript returns the embedded Node.js script
// This function will be implemented to access the script from the main package
func getEmbeddedScript() string {
	// This will be implemented to access the embedded script
	// For now, we'll need to import it from the main package
	return ""
}
