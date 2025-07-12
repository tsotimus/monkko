import { readFileSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

export function getGeneratedFields(modelName: string): string[] {
    const filePath = join(process.cwd(), `src/types/db/${modelName}.schema.ts`);

    try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const schemaName = `${modelName.charAt(0).toUpperCase() + modelName.slice(1)}Schema`;
        
        // Parse the TypeScript file using the compiler API
        const sourceFile = ts.createSourceFile(
            filePath,
            fileContent,
            ts.ScriptTarget.Latest,
            true
        );

        const fields: string[] = [];

        function visit(node: ts.Node): void {
            // Look for variable declarations with the schema name
            if (ts.isVariableDeclaration(node) && 
                node.name && ts.isIdentifier(node.name) && 
                node.name.text === schemaName) {
                
                // Look for z.object() call
                if (node.initializer && ts.isCallExpression(node.initializer)) {
                    const callExpr = node.initializer;
                    
                    // Check if it's z.object(...)
                    if (ts.isPropertyAccessExpression(callExpr.expression)) {
                        const propAccess = callExpr.expression;
                        if (ts.isIdentifier(propAccess.expression) &&
                            propAccess.expression.text === 'z' &&
                            ts.isIdentifier(propAccess.name) &&
                            propAccess.name.text === 'object') {
                            
                            // Get the first argument (the object literal)
                            const firstArg = callExpr.arguments[0];
                            if (callExpr.arguments.length > 0 && 
                                firstArg && ts.isObjectLiteralExpression(firstArg)) {
                                
                                const objectLiteral = firstArg as ts.ObjectLiteralExpression;
                                for (const property of objectLiteral.properties) {
                                    if (ts.isPropertyAssignment(property) && 
                                        (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name))) {
                                        
                                        const fieldName = ts.isIdentifier(property.name) 
                                            ? property.name.text 
                                            : property.name.text;
                                        fields.push(fieldName);
                                    }
                                }
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