import { glob } from 'glob';
import { compareFile, FileComparisonResult } from './compareFile';

/**
 * Compare all files in the mock directory with their generated counterparts
 */
export async function compareAllFiles(
  mockDir: string,
  generatedDir: string
): Promise<FileComparisonResult[]> {
  const mockFiles = await glob('**/*.ts', { cwd: mockDir });
  const results: FileComparisonResult[] = [];

  for (const relativePath of mockFiles) {
    const result = await compareFile(mockDir, generatedDir, relativePath);
    results.push(result);
  }

  return results;
} 