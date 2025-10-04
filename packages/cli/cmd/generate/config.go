package generate

import (
	"encoding/json"
	"fmt"
	"os"
)

func LoadConfig(debug bool) (*Config, error) {
	// Default config (fallback if no config file)
	config := &Config{
		OutputDir: "generated", // Fallback if no config file
	}

	// Try to load monko.config.json
	if _, err := os.Stat("monko.config.json"); err == nil {
		if debug {
			fmt.Println("📝 Loading monko.config.json...")
		}

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
		return nil, fmt.Errorf("no monko.config.json found. Run '@monkko/cli init' to create one")
	}

	return config, nil
}
