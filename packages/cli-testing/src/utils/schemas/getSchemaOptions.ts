import { SchemaFile } from './loadSchemas';

import {SchemaDefinition} from '@monkko/orm'

export const getSchemaOptions = (loadedSchemas: SchemaFile[]) => {
    const allOptions: Record<string, SchemaDefinition['options']> = {};

    for (const schemaFile of loadedSchemas) {
        for (const schemaName in schemaFile.schemas) {
            const schema = schemaFile.schemas[schemaName];
            if (schema && schema.options) {
                allOptions[schemaName] = schema.options;
            }
        }
    }

    return allOptions;
}