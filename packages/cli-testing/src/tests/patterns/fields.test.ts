import { describe, it, beforeAll, expect } from 'vitest';
import { EXPECTED_SCHEMAS } from '../config';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

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

function getGeneratedFields(modelName: string): string[] {
    const filePath = join(process.cwd(), `src/types/db/${modelName}.types.ts`);

    try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const interfaceContentMatch = fileContent.match(/export interface \w+ \{([^}]+)\}/);

        if (!interfaceContentMatch || !interfaceContentMatch[1]) {
            return [];
        }

        const interfaceContent = interfaceContentMatch[1];
        const fieldMatches = [...interfaceContent.matchAll(/\s*(\w+)\s*:/g)];
        
        return fieldMatches.map(match => match[1]).filter(Boolean) as string[];
    } catch (error) {
        return [];
    }
}

describe("Field confirmation", () => {
    it("should confirm that the fields are correct", () => {
        const sourceFields = getFields(); 

        for (const schemaName of Object.keys(sourceFields)) {
            const generatedFields = getGeneratedFields(schemaName);
            const expectedFields = sourceFields[schemaName];

            expect(generatedFields).toEqual(expect.arrayContaining(expectedFields as any[]));
            expect(expectedFields).toEqual(expect.arrayContaining(generatedFields));
        }
    });
});