import { readFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

export function getGeneratedTypes(modelName: string): string[] {
    const filePath = join(process.cwd(), `src/types/db/${modelName}.schema.ts`);

    try {
        const fileContent = readFileSync(filePath, 'utf-8');
        
        // Parse the TypeScript file using the compiler API
        const sourceFile = ts.createSourceFile(
            filePath,
            fileContent,
            ts.ScriptTarget.Latest,
            true
        );

        const exportedTypes: string[] = [];

        function visit(node: ts.Node): void {
            // Look for type alias declarations that are exported
            if (ts.isTypeAliasDeclaration(node) && 
                node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
                
                if (ts.isIdentifier(node.name)) {
                    exportedTypes.push(node.name.text);
                }
            }
            
            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
        return exportedTypes;
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error);
        return [];
    }
}

export function getExpectedTypes(modelName: string): string[] {
    // Based on the pattern observed in generated files, each model should have these types
    return [
        `${modelName}Document`,
        `Create${modelName}Input`,
        `Update${modelName}Input`
    ];
} 