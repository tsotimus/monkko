package generate

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func FindSchemaFiles(config *Config, debug bool) ([]string, error) {
	var files []string

	// Determine search paths
	searchPaths := config.Includes
	if len(searchPaths) == 0 {
		searchPaths = []string{"."} // Default to current directory
	}

	for _, searchPath := range searchPaths {
		// Clean up glob patterns - filepath.Walk is already recursive
		// Convert "src/schemas/**" to "src/schemas"
		cleanPath := strings.TrimSuffix(searchPath, "/**")
		cleanPath = strings.TrimSuffix(cleanPath, "/*")

		// Check if directory exists
		if _, err := os.Stat(cleanPath); os.IsNotExist(err) {
			if debug {
				fmt.Printf("⚠️  Directory %s does not exist, skipping...\n", cleanPath)
			}
			continue
		}

		err := filepath.Walk(cleanPath, func(path string, info os.FileInfo, err error) error {
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
