import { readFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

export function getGeneratedFields(modelName: string): string[] {
    const filePath = join(process.cwd(), `src/types/db/${modelName}.types.ts`);

    try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const typeName = `${modelName.charAt(0).toUpperCase() + modelName.slice(1)}Document`;
        
        // Parse the TypeScript file using the compiler API
        const sourceFile = ts.createSourceFile(
            filePath,
            fileContent,
            ts.ScriptTarget.Latest,
            true
        );

        const fields: string[] = [];

        function visit(node: ts.Node) {
            // Look for type alias declarations
            if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
                // Check if it's a type literal (object type)
                if (ts.isTypeLiteralNode(node.type)) {
                    // Extract property signatures
                    for (const member of node.type.members) {
                        if (ts.isPropertySignature(member) && member.name) {
                            if (ts.isIdentifier(member.name)) {
                                fields.push(member.name.text);
                            }
                        }
                    }
                }
            }
            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
        return fields;
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        return [];
    }
}