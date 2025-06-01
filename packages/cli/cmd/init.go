package main

import (
	"bufio"
	"fmt"
	"os"
	"strings"

	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize a new Monko project",
	Long:  `Creates a monko.config.ts file with sensible defaults and updates .gitignore.`,
	RunE:  runInit,
}

func runInit(cmd *cobra.Command, args []string) error {
	fmt.Println("🚀 Initializing Monko project...")

	// Step 1: Check if config already exists
	if _, err := os.Stat("monko.config.ts"); err == nil {
		fmt.Println("⚠️  monko.config.ts already exists. Skipping config creation.")
	} else {
		// Step 2: Create monko.config.ts with defaults
		err := createConfigFile()
		if err != nil {
			return fmt.Errorf("failed to create config file: %w", err)
		}
		fmt.Println("✅ Created monko.config.ts")
	}

	// Step 3: Update/create .gitignore
	err := updateGitignore()
	if err != nil {
		return fmt.Errorf("failed to update .gitignore: %w", err)
	}
	fmt.Println("✅ Updated .gitignore")

	fmt.Println("\n🎉 Monko project initialized successfully!")
	fmt.Println("\nNext steps:")
	fmt.Println("  1. Create your first schema file (*.monko.ts)")
	fmt.Println("  2. Run 'monko generate' to generate types")

	return nil
}

func createConfigFile() error {
	configContent := `import { defineConfig } from "@monko/orm";

export default defineConfig({
  outputDir: "types/monko",
  excludes: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/.git/**",
    "**/build/**"
  ]
});
`

	return os.WriteFile("monko.config.ts", []byte(configContent), 0644)
}

func updateGitignore() error {
	const outputDir = "types/monko"
	const gitignoreFile = ".gitignore"

	// Check if .gitignore exists
	var existingContent []string
	if file, err := os.Open(gitignoreFile); err == nil {
		defer file.Close()
		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			existingContent = append(existingContent, line)

			// Check if outputDir is already ignored
			if line == outputDir || line == "/"+outputDir {
				// Already exists, no need to add
				return nil
			}
		}
	}

	// Add outputDir to .gitignore
	file, err := os.OpenFile(gitignoreFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	// Add newline if file exists and doesn't end with one
	if len(existingContent) > 0 {
		if _, err := file.WriteString("\n"); err != nil {
			return err
		}
	}

	// Add comment and outputDir
	_, err = file.WriteString("# Monko generated types\n" + outputDir + "\n")
	return err
}
