import { describe, it, beforeAll, expect } from 'vitest';
import { getGeneratedFields } from '@/utils/getGeneratedFields';
import { loadSchemas, SchemaFile } from '@/utils/schemas/loadSchemas';
import { getSchemaFields } from '@/utils/schemas/getSchemaFields';



let loadedSchemas: SchemaFile[] = [];

beforeAll(async () => {
    loadedSchemas = await loadSchemas();
});




describe("Field confirmation", () => {
    it("Required and optional fields are present", () => {
        const sourceFields = getSchemaFields(loadedSchemas); 

        for (const schemaName of Object.keys(sourceFields)) {
            const generatedFields = getGeneratedFields(schemaName);
            const expectedFields = sourceFields[schemaName];
            
            // Check that each expected field exists in the generated fields
            if (expectedFields) {
                for (const expectedField of expectedFields) {
                    expect(generatedFields).toContain(expectedField);
                }
            }
        }
    });

    it("_id is present", () => {
        const fields = getSchemaFields(loadedSchemas);
        for (const schemaName of Object.keys(fields)) {
            const generatedFields = getGeneratedFields(schemaName);

            expect(generatedFields).toContain('_id');
        }
    });

    it("")

});

