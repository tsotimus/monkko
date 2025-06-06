package validator

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// TestCase represents a single integration test case
type TestCase struct {
	Name              string                   `json:"name"`
	SchemaFile        string                   `json:"schemaFile"`
	ExpectedTypeFiles []string                 `json:"expectedTypeFiles"`
	Description       string                   `json:"description"`
	ValidationRules   map[string]SchemaRuleSet `json:"validationRules,omitempty"`
}

// SchemaRuleSet defines validation rules for a specific schema
type SchemaRuleSet struct {
	Fields          map[string]FieldRule `json:"fields"`
	HasTimestamps   bool                 `json:"hasTimestamps"`
	ExpectedTypes   []string             `json:"expectedTypes"`
	RequiredImports []string             `json:"requiredImports,omitempty"`
}

// FieldRule defines validation rules for a specific field
type FieldRule struct {
	Type     string `json:"type"`
	Required bool   `json:"required"`
	Unique   bool   `json:"unique,omitempty"`
}

// ValidationResult contains the results of validating generated types
type ValidationResult struct {
	SchemaRulesValid bool                  `json:"schemaRulesValid"`
	GoldenFileMatch  bool                  `json:"goldenFileMatch"`
	PatternMatches   []PatternMatchResult  `json:"patternMatches"`
	Errors           []string              `json:"errors"`
	Warnings         []string              `json:"warnings"`
	FileResults      map[string]FileResult `json:"fileResults"`
}

// PatternMatchResult represents the result of a pattern validation
type PatternMatchResult struct {
	Pattern string `json:"pattern"`
	Matched bool   `json:"matched"`
	Error   string `json:"error,omitempty"`
}

// FileResult contains validation results for a specific generated file
type FileResult struct {
	Exists           bool     `json:"exists"`
	ContentValid     bool     `json:"contentValid"`
	SchemaRulesValid bool     `json:"schemaRulesValid"`
	Errors           []string `json:"errors"`
	Warnings         []string `json:"warnings"`
}

// TestSuite represents a collection of test cases
type TestSuite struct {
	Cases []TestCase `json:"cases"`
}

// LoadTestSuite loads test cases from a JSON file
func LoadTestSuite(filePath string) (*TestSuite, error) {
	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read test suite file: %w", err)
	}

	var suite TestSuite
	err = json.Unmarshal(data, &suite)
	if err != nil {
		return nil, fmt.Errorf("failed to parse test suite JSON: %w", err)
	}

	return &suite, nil
}

// ValidateGeneratedTypes validates generated TypeScript files against test case rules
func ValidateGeneratedTypes(testCase TestCase, generatedFiles map[string]string, goldenDir string) ValidationResult {
	result := ValidationResult{
		PatternMatches: make([]PatternMatchResult, 0),
		Errors:         make([]string, 0),
		Warnings:       make([]string, 0),
		FileResults:    make(map[string]FileResult),
	}

	// Validate each expected file
	for _, expectedFile := range testCase.ExpectedTypeFiles {
		fileResult := validateSingleFile(expectedFile, generatedFiles[expectedFile], testCase, goldenDir)
		result.FileResults[expectedFile] = fileResult

		if !fileResult.Exists {
			result.Errors = append(result.Errors, fmt.Sprintf("Expected file not generated: %s", expectedFile))
		}
	}

	// Overall validation status
	result.SchemaRulesValid = allFilesValid(result.FileResults, func(fr FileResult) bool {
		return fr.SchemaRulesValid
	})
	result.GoldenFileMatch = allFilesValid(result.FileResults, func(fr FileResult) bool {
		return fr.ContentValid
	})

	return result
}

func validateSingleFile(filePath, content string, testCase TestCase, goldenDir string) FileResult {
	result := FileResult{
		Exists:           content != "",
		ContentValid:     true,
		SchemaRulesValid: true,
		Errors:           make([]string, 0),
		Warnings:         make([]string, 0),
	}

	if !result.Exists {
		result.Errors = append(result.Errors, "File does not exist")
		return result
	}

	// Extract schema name from file path (e.g., "User" from "generated/User.types.ts")
	baseName := strings.TrimSuffix(filepath.Base(filePath), ".types.ts")

	// Validate against schema rules if they exist
	if rules, exists := testCase.ValidationRules[baseName]; exists {
		schemaErrors := validateSchemaRules(content, rules, baseName)
		if len(schemaErrors) > 0 {
			result.SchemaRulesValid = false
			result.Errors = append(result.Errors, schemaErrors...)
		}
	}

	// Validate against golden file if it exists
	goldenPath := filepath.Join(goldenDir, testCase.Name, filepath.Base(filePath))
	if goldenContent, err := os.ReadFile(goldenPath); err == nil {
		if !compareContent(content, string(goldenContent)) {
			result.ContentValid = false
			result.Errors = append(result.Errors, "Content doesn't match golden file")
		}
	} else {
		result.Warnings = append(result.Warnings, fmt.Sprintf("No golden file found at %s", goldenPath))
	}

	return result
}

func validateSchemaRules(content string, rules SchemaRuleSet, schemaName string) []string {
	var errors []string

	// Check required imports
	for _, requiredImport := range rules.RequiredImports {
		if !strings.Contains(content, requiredImport) {
			errors = append(errors, fmt.Sprintf("Missing required import: %s", requiredImport))
		}
	}

	// Check expected type definitions
	for _, expectedType := range rules.ExpectedTypes {
		if !strings.Contains(content, fmt.Sprintf("export type %s", expectedType)) {
			errors = append(errors, fmt.Sprintf("Missing expected type: %s", expectedType))
		}
	}

	// Check field mappings
	for fieldName, fieldRule := range rules.Fields {
		expectedPattern := buildFieldPattern(fieldName, fieldRule)
		if !strings.Contains(content, expectedPattern) {
			errors = append(errors, fmt.Sprintf("Field %s doesn't match expected pattern: %s", fieldName, expectedPattern))
		}
	}

	// Check timestamps
	if rules.HasTimestamps {
		if !strings.Contains(content, "createdAt: Date") || !strings.Contains(content, "updatedAt: Date") {
			errors = append(errors, "Missing timestamp fields (createdAt/updatedAt)")
		}
	}

	return errors
}

func buildFieldPattern(fieldName string, rule FieldRule) string {
	optional := ""
	if !rule.Required {
		optional = "?"
	}
	return fmt.Sprintf("%s%s: %s", fieldName, optional, mapTypeScriptType(rule.Type))
}

func mapTypeScriptType(schemaType string) string {
	switch schemaType {
	case "string":
		return "string"
	case "number":
		return "number"
	case "boolean":
		return "boolean"
	case "date":
		return "Date"
	case "objectId":
		return "ObjectId"
	default:
		return "any"
	}
}

func compareContent(generated, golden string) bool {
	// Normalize whitespace for comparison
	return strings.TrimSpace(generated) == strings.TrimSpace(golden)
}

func allFilesValid(fileResults map[string]FileResult, check func(FileResult) bool) bool {
	for _, result := range fileResults {
		if !check(result) {
			return false
		}
	}
	return true
}
