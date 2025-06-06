import { glob } from 'glob';

/**
 * Get all mock files that should have corresponding generated files
 */
export async function getExpectedFiles(mockDir: string): Promise<string[]> {
  return await glob('**/*.ts', { cwd: mockDir });
} 