import { SchemaFile } from './loadSchemas';

export const getSchemaFields = (loadedSchemas: SchemaFile[]) => {
    const allFields: Record<string, string[]> = {};

    for (const schemaFile of loadedSchemas) {
        for (const schemaName in schemaFile.schemas) {
            const schema = schemaFile.schemas[schemaName];
            if (schema && schema.fields) {
                const fieldKeys = Object.keys(schema.fields);
                allFields[schemaName] = fieldKeys;
            }
        }
    }

    return allFields;
}
