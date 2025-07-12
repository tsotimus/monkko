import { SchemaFile } from './loadSchemas';

export function getSchemaNames(loadedSchemas: SchemaFile[]): string[] {
    const schemaNames: string[] = [];
    
    for (const schemaFile of loadedSchemas) {
        // Get all exported schema names from the module
        const exportedNames = Object.keys(schemaFile.schemas);
        
        // Filter for schema names (exclude default exports and other non-schema exports)
        const schemas = exportedNames.filter(name => 
            name !== 'default' && 
            typeof schemaFile.schemas[name] === 'object' &&
            schemaFile.schemas[name] !== null
        );
        
        schemaNames.push(...schemas);
    }
    
    return schemaNames;
} 