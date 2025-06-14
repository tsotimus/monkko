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

describe("Field confirmation", () => {
    it("should confirm that the fields are correct", () => {
        console.log(loadedSchemas);
        // const fields = getFields();
        // console.log(fields);
        // expect(fields).toBeDefined();
    });
});