import { describe, it, beforeAll, expect } from 'vitest';
import { loadSchemas, SchemaFile } from '@/utils/schemas/loadSchemas';
import { getSchemaNames } from '@/utils/schemas/getSchemaNames';
import { getGeneratedTypes, getExpectedTypes } from '@/utils/generation/types/getGeneratedTypes';

let loadedSchemas: SchemaFile[] = [];

beforeAll(async () => {
    loadedSchemas = await loadSchemas();
});

describe("TypeScript Type Exports", () => {
    it("All expected types are exported from generated schemas", () => {
        const schemaNames = getSchemaNames(loadedSchemas);
        
        for (const schemaName of schemaNames) {
            const generatedTypes = getGeneratedTypes(schemaName);
            const expectedTypes = getExpectedTypes(schemaName);
            
            // Check that each expected type exists in the generated types
            for (const expectedType of expectedTypes) {
                expect(generatedTypes).toContain(expectedType);
            }
        }
    });

    it("Document type is exported for each schema", () => {
        const schemaNames = getSchemaNames(loadedSchemas);
        
        for (const schemaName of schemaNames) {
            const generatedTypes = getGeneratedTypes(schemaName);
            const documentType = `${schemaName}Document`;
            
            expect(generatedTypes).toContain(documentType);
        }
    });

    it("Create input type is exported for each schema", () => {
        const schemaNames = getSchemaNames(loadedSchemas);
        
        for (const schemaName of schemaNames) {
            const generatedTypes = getGeneratedTypes(schemaName);
            const createType = `Create${schemaName}Input`;
            
            expect(generatedTypes).toContain(createType);
        }
    });

    it("Update input type is exported for each schema", () => {
        const schemaNames = getSchemaNames(loadedSchemas);
        
        for (const schemaName of schemaNames) {
            const generatedTypes = getGeneratedTypes(schemaName);
            const updateType = `Update${schemaName}Input`;
            
            expect(generatedTypes).toContain(updateType);
        }
    });

    it("No unexpected types are exported", () => {
        const schemaNames = getSchemaNames(loadedSchemas);
        
        for (const schemaName of schemaNames) {
            const generatedTypes = getGeneratedTypes(schemaName);
            const expectedTypes = getExpectedTypes(schemaName);
            
            // Check that no extra types are exported beyond the expected ones
            for (const generatedType of generatedTypes) {
                expect(expectedTypes).toContain(generatedType);
            }
        }
    });

    it("Generated types follow naming convention", () => {
        const schemaNames = getSchemaNames(loadedSchemas);
        
        for (const schemaName of schemaNames) {
            const generatedTypes = getGeneratedTypes(schemaName);
            
            // Check that types follow the expected naming pattern
            const documentType = generatedTypes.find(type => type.endsWith('Document'));
            const createType = generatedTypes.find(type => type.startsWith('Create') && type.endsWith('Input'));
            const updateType = generatedTypes.find(type => type.startsWith('Update') && type.endsWith('Input'));
            
            expect(documentType).toBeDefined();
            expect(createType).toBeDefined();
            expect(updateType).toBeDefined();
            
            // Verify they match the schema name
            expect(documentType).toBe(`${schemaName}Document`);
            expect(createType).toBe(`Create${schemaName}Input`);
            expect(updateType).toBe(`Update${schemaName}Input`);
        }
    });
});


