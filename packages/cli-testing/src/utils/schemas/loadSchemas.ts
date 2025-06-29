import { EXPECTED_SCHEMAS } from "@/tests/config";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export type SchemaFile = {
    file: string;
    schemas: Record<string, any>;
}



export const loadSchemas = async() => {

    let loadedSchemas: SchemaFile[] = [];

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

    return loadedSchemas;
}