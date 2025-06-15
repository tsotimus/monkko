package generate

import (
	"fmt"
	"strings"
)

// mapToSchema converts a map[string]interface{} from goja into our typed Schema struct.
func mapToSchema(varName string, schemaMap map[string]interface{}) (Schema, error) {
	fmt.Printf("...... Parsing config for schema: %s\n", varName)

	// Set default values
	schema := Schema{
		Name:       varName,
		Collection: strings.ToLower(varName),
		Fields:     make(map[string]Field),
	}

	// Extract top-level properties
	if name, ok := schemaMap["name"].(string); ok {
		schema.Name = name
	}
	if db, ok := schemaMap["db"].(string); ok {
		schema.DB = db
	}
	if collection, ok := schemaMap["collection"].(string); ok {
		schema.Collection = collection
	}
	fmt.Printf("......... Name: %s, DB: %s, Collection: %s\n", schema.Name, schema.DB, schema.Collection)

	// Extract fields
	if fieldsMap, ok := schemaMap["fields"].(map[string]interface{}); ok {
		fmt.Println("......... Found fields object. Parsing fields...")
		fields := make(map[string]Field)
		for fieldName, fieldVal := range fieldsMap {
			fieldObj, ok := fieldVal.(map[string]interface{})
			if !ok {
				continue
			}
			field := Field{}
			if fType, ok := fieldObj["type"].(string); ok {
				field.Type = fType
			}
			if required, ok := fieldObj["required"].(bool); ok {
				field.Required = required
			}
			if unique, ok := fieldObj["unique"].(bool); ok {
				field.Unique = unique
			}
			if optional, ok := fieldObj["optional"].(bool); ok {
				field.Optional = optional
			}
			fmt.Printf("............... Found field: %s, Type: %s\n", fieldName, field.Type)
			fields[fieldName] = field
		}
		schema.Fields = fields
	}

	// Extract options
	if optionsMap, ok := schemaMap["options"].(map[string]interface{}); ok {
		fmt.Println("......... Found options object. Parsing options...")
		options := Options{}
		if timestamps, ok := optionsMap["timestamps"].(bool); ok {
			options.Timestamps = timestamps
			fmt.Printf("............... Found timestamps: %t\n", timestamps)
		}
		schema.Options = options
	}

	return schema, nil
}
