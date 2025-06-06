package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestCase represents a single integration test case
type TestCase struct {
	Name              string   `json:"name"`
	SchemaFile        string   `json:"schemaFile"`
	ExpectedTypeFiles []string `json:"expectedTypeFiles"`
	Description       string   `json:"description"`
}

// TestSuite represents a collection of test cases
type TestSuite struct {
	Cases []TestCase `json:"cases"`
}

func TestGenerateIntegration(t *testing.T) {
	// Load test suite configuration
	suite, err := loadTestSuite()
	if err != nil {
		t.Fatalf("Failed to load test suite: %v", err)
	}

	for _, testCase := range suite.Cases {
		t.Run(testCase.Name, func(t *testing.T) {
			runIntegrationTest(t, testCase)
		})
	}
}

func TestGenerateFromExampleSchema(t *testing.T) {
	// This is a specific test for the current example.monko.ts
	testCase := TestCase{
		Name:       "example_schema",
		SchemaFile: "test/example.monko.ts",
		ExpectedTypeFiles: []string{
			"generated/User.types.ts",
			"generated/Post.types.ts",
		},
		Description: "Test generation from example.monko.ts containing User and Post schemas",
	}

	runIntegrationTest(t, testCase)
}

func runIntegrationTest(t *testing.T, testCase TestCase) {
	// Create a temporary directory for this test
	tempDir := t.TempDir()

	// Copy the schema file to temp directory
	err := copyFile(testCase.SchemaFile, filepath.Join(tempDir, filepath.Base(testCase.SchemaFile)))
	if err != nil {
		t.Fatalf("Failed to copy schema file: %v", err)
	}

	// Copy necessary scripts and config files
	err = copyRequiredFiles(tempDir)
	if err != nil {
		t.Fatalf("Failed to copy required files: %v", err)
	}

	// Change to temp directory
	originalDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	defer os.Chdir(originalDir)

	err = os.Chdir(tempDir)
	if err != nil {
		t.Fatalf("Failed to change to temp directory: %v", err)
	}

	// Run the generation
	err = runGenerate(nil, []string{})
	if err != nil {
		t.Fatalf("Generation failed: %v", err)
	}

	// Verify expected files were generated
	for _, expectedFile := range testCase.ExpectedTypeFiles {
		if !fileExists(expectedFile) {
			t.Errorf("Expected file not generated: %s", expectedFile)
			continue
		}

		// Read the generated content
		content, err := os.ReadFile(expectedFile)
		if err != nil {
			t.Errorf("Failed to read generated file %s: %v", expectedFile, err)
			continue
		}

		// Validate the content has the expected structure
		err = validateTypeScriptContent(string(content), expectedFile)
		if err != nil {
			t.Errorf("Generated content validation failed for %s: %v", expectedFile, err)
		}
	}

	// Load expected content if golden files exist
	err = compareWithGoldenFiles(t, testCase)
	if err != nil {
		t.Errorf("Golden file comparison failed: %v", err)
	}
}

func loadTestSuite() (*TestSuite, error) {
	// Try to load test-suite.json if it exists
	if fileExists("test-suite.json") {
		data, err := os.ReadFile("test-suite.json")
		if err != nil {
			return nil, err
		}

		var suite TestSuite
		err = json.Unmarshal(data, &suite)
		if err != nil {
			return nil, err
		}

		return &suite, nil
	}

	// Return default test suite if no config file
	return &TestSuite{
		Cases: []TestCase{
			{
				Name:       "example_schema",
				SchemaFile: "test/example.monko.ts",
				ExpectedTypeFiles: []string{
					"generated/User.types.ts",
					"generated/Post.types.ts",
				},
				Description: "Test generation from example.monko.ts",
			},
		},
	}, nil
}

func copyFile(src, dst string) error {
	data, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, data, 0644)
}

func copyRequiredFiles(tempDir string) error {
	// Copy scripts directory
	err := copyDir("scripts", filepath.Join(tempDir, "scripts"))
	if err != nil {
		return err
	}

	// Copy config file if it exists
	if fileExists("monko.config.json") {
		err = copyFile("monko.config.json", filepath.Join(tempDir, "monko.config.json"))
		if err != nil {
			return err
		}
	}

	// Copy package.json for node dependencies
	if fileExists("package.json") {
		err = copyFile("package.json", filepath.Join(tempDir, "package.json"))
		if err != nil {
			return err
		}
	}

	return nil
}

func copyDir(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, err := filepath.Rel(src, path)
		if err != nil {
			return err
		}

		dstPath := filepath.Join(dst, relPath)

		if info.IsDir() {
			return os.MkdirAll(dstPath, info.Mode())
		}

		return copyFile(path, dstPath)
	})
}

func fileExists(filename string) bool {
	_, err := os.Stat(filename)
	return !os.IsNotExist(err)
}

func validateTypeScriptContent(content, filename string) error {
	// Basic validation checks
	requiredImports := []string{
		"import type { ObjectId } from 'mongodb';",
	}

	for _, required := range requiredImports {
		if !strings.Contains(content, required) {
			return fmt.Errorf("Missing required import in %s: %s", filename, required)
		}
	}

	// Check for expected type exports based on filename
	baseName := strings.TrimSuffix(filepath.Base(filename), ".types.ts")
	expectedTypes := []string{
		fmt.Sprintf("export type %sDocument", baseName),
		fmt.Sprintf("export type Create%sInput", baseName),
		fmt.Sprintf("export type Update%sInput", baseName),
	}

	for _, expectedType := range expectedTypes {
		if !strings.Contains(content, expectedType) {
			return fmt.Errorf("Missing expected type in %s: %s", filename, expectedType)
		}
	}

	return nil
}

func compareWithGoldenFiles(t *testing.T, testCase TestCase) error {
	goldenDir := "testdata/golden"

	if !fileExists(goldenDir) {
		// No golden files yet, create them for future comparisons
		t.Logf("Creating golden files for test case: %s", testCase.Name)
		return createGoldenFiles(testCase, goldenDir)
	}

	// Compare with existing golden files
	for _, expectedFile := range testCase.ExpectedTypeFiles {
		goldenFile := filepath.Join(goldenDir, testCase.Name, filepath.Base(expectedFile))

		if !fileExists(goldenFile) {
			t.Logf("Golden file doesn't exist, creating: %s", goldenFile)
			continue
		}

		generated, err := os.ReadFile(expectedFile)
		if err != nil {
			return err
		}

		golden, err := os.ReadFile(goldenFile)
		if err != nil {
			return err
		}

		if strings.TrimSpace(string(generated)) != strings.TrimSpace(string(golden)) {
			t.Errorf("Generated content doesn't match golden file for %s", expectedFile)
			t.Logf("Generated:\n%s", string(generated))
			t.Logf("Golden:\n%s", string(golden))
		}
	}

	return nil
}

func createGoldenFiles(testCase TestCase, goldenDir string) error {
	testDir := filepath.Join(goldenDir, testCase.Name)
	err := os.MkdirAll(testDir, 0755)
	if err != nil {
		return err
	}

	for _, expectedFile := range testCase.ExpectedTypeFiles {
		if fileExists(expectedFile) {
			goldenFile := filepath.Join(testDir, filepath.Base(expectedFile))
			err = copyFile(expectedFile, goldenFile)
			if err != nil {
				return err
			}
		}
	}

	return nil
}
