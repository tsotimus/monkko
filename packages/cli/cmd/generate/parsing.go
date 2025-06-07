package generate

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
)

// ParseSchemaFiles extracts schemas from .monko.ts files using ESBuild's Go API
func ParseSchemaFiles(files []string) ([]Schema, error) {
	var allSchemas []Schema

	for _, file := range files {
		schemas, err := parseSchemaFile(file)
		if err != nil {
			return nil, fmt.Errorf("error parsing %s: %w", file, err)
		}
		allSchemas = append(allSchemas, schemas...)
	}

	return allSchemas, nil
}

// parseSchemaFile parses a single .monko.ts file and extracts schema definitions
func parseSchemaFile(filename string) ([]Schema, error) {
	// Read the source file
	sourceCode, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("failed to read file: %w", err)
	}

	// Transform TypeScript to JavaScript using ESBuild
	result := api.Transform(string(sourceCode), api.TransformOptions{
		Loader:     api.LoaderTS,
		Format:     api.FormatESModule,
		Target:     api.ES2020,
		Sourcefile: filename,
	})

	// Check for transformation errors
	if len(result.Errors) > 0 {
		var errorMsgs []string
		for _, err := range result.Errors {
			errorMsgs = append(errorMsgs, err.Text)
		}
		return nil, fmt.Errorf("ESBuild transformation errors: %s", strings.Join(errorMsgs, "; "))
	}

	// Parse schemas from the original source code (not transformed)
	// We use the original source because it's more predictable for regex parsing
	return extractSchemasFromSource(string(sourceCode), filename)
}

// extractSchemasFromSource uses regex to extract schema definitions from TypeScript source
func extractSchemasFromSource(sourceCode, filename string) ([]Schema, error) {
	var schemas []Schema

	// Regex to match: export const SchemaName = defineSchema({ ... })
	defineSchemaRegex := regexp.MustCompile(`export\s+const\s+(\w+)\s*=\s*defineSchema\s*\(\s*({[\s\S]*?})\s*\)`)

	matches := defineSchemaRegex.FindAllStringSubmatch(sourceCode, -1)

	for _, match := range matches {
		if len(match) != 3 {
			continue
		}

		variableName := match[1]
		configString := match[2]

		schema, err := parseSchemaConfig(configString, variableName)
		if err != nil {
			return nil, fmt.Errorf("error parsing schema %s: %w", variableName, err)
		}

		schemas = append(schemas, schema)
	}

	return schemas, nil
}

// parseSchemaConfig parses the schema configuration object
func parseSchemaConfig(configString, variableName string) (Schema, error) {
	schema := Schema{
		Name:       variableName,
		DB:         "default",
		Collection: strings.ToLower(variableName),
		Fields:     make(map[string]Field),
		Options:    Options{},
	}

	// Extract basic string properties
	if name := extractStringProperty(configString, "name"); name != "" {
		schema.Name = name
	}
	if db := extractStringProperty(configString, "db"); db != "" {
		schema.DB = db
	}
	if collection := extractStringProperty(configString, "collection"); collection != "" {
		schema.Collection = collection
	}

	// Extract fields object
	if fieldsString := extractObjectProperty(configString, "fields"); fieldsString != "" {
		fields, err := parseFields(fieldsString)
		if err != nil {
			return schema, fmt.Errorf("error parsing fields: %w", err)
		}
		schema.Fields = fields
	}

	// Extract options object
	if optionsString := extractObjectProperty(configString, "options"); optionsString != "" {
		options, err := parseOptions(optionsString)
		if err != nil {
			return schema, fmt.Errorf("error parsing options: %w", err)
		}
		schema.Options = options
	}

	return schema, nil
}

// parseFields parses the fields object from the schema configuration
func parseFields(fieldsString string) (map[string]Field, error) {
	fields := make(map[string]Field)

	// Regex to match: fieldName: fields.type({ options })
	fieldRegex := regexp.MustCompile(`(\w+)\s*:\s*fields\.(\w+)\s*\(\s*({[^}]*})?\s*\)`)

	matches := fieldRegex.FindAllStringSubmatch(fieldsString, -1)

	for _, match := range matches {
		if len(match) < 3 {
			continue
		}

		fieldName := match[1]
		fieldType := match[2]
		optionsString := ""
		if len(match) > 3 {
			optionsString = match[3]
		}

		field := Field{
			Type:     fieldType,
			Required: false,
			Unique:   false,
			Optional: false,
		}

		// Parse field options if present
		if optionsString != "" {
			if required := extractBoolProperty(optionsString, "required"); required != nil {
				field.Required = *required
			}
			if unique := extractBoolProperty(optionsString, "unique"); unique != nil {
				field.Unique = *unique
			}
			if optional := extractBoolProperty(optionsString, "optional"); optional != nil {
				field.Optional = *optional
			}
		}

		fields[fieldName] = field
	}

	return fields, nil
}

// parseOptions parses the options object from the schema configuration
func parseOptions(optionsString string) (Options, error) {
	options := Options{}

	if timestamps := extractBoolProperty(optionsString, "timestamps"); timestamps != nil {
		options.Timestamps = *timestamps
	}

	return options, nil
}

// Helper functions for extracting properties using regex

func extractStringProperty(source, propertyName string) string {
	pattern := fmt.Sprintf(`%s\s*:\s*["']([^"']+)["']`, propertyName)
	regex := regexp.MustCompile(pattern)
	matches := regex.FindStringSubmatch(source)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

func extractObjectProperty(source, propertyName string) string {
	// This is a simplified approach - for nested objects, we'll need more sophisticated parsing
	pattern := fmt.Sprintf(`%s\s*:\s*{([^{}]*(?:{[^{}]*}[^{}]*)*)}`, propertyName)
	regex := regexp.MustCompile(pattern)
	matches := regex.FindStringSubmatch(source)
	if len(matches) > 1 {
		return matches[1]
	}
	return ""
}

func extractBoolProperty(source, propertyName string) *bool {
	pattern := fmt.Sprintf(`%s\s*:\s*(true|false)`, propertyName)
	regex := regexp.MustCompile(pattern)
	matches := regex.FindStringSubmatch(source)
	if len(matches) > 1 {
		value, err := strconv.ParseBool(matches[1])
		if err == nil {
			return &value
		}
	}
	return nil
}
