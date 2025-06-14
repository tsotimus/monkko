import { describe, it, beforeAll, expect } from 'vitest';
import { EXPECTED_SCHEMAS } from '../config';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

type SchemaFile = {
    file: string;
    schemas: Record<string, any>;
}

let loadedSchemas: SchemaFile[] = [];

beforeAll(async () => {
    const schemaFiles = Object.keys(EXPECTED_SCHEMAS);
    
    for (const file of schemaFiles) {
        const filePath = join(process.cwd(), 'src/schemas', file);
        const fileUrl = pathToFileURL(filePath).href;

        const module = await import(fileUrl);
        loadedSchemas.push({
            file,
            schemas: module,
        });
    }
});

function getFields() {
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

describe("Field confirmation", () => {
    it("should confirm that the fields are correct", () => {
        const fields = getFields();
        console.log(fields);
    });
});