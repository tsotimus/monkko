import { stat } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Check if a generated file exists
 */
export async function fileExists(
  generatedDir: string,
  relativePath: string
): Promise<boolean> {
  try {
    const generatedFile = join(generatedDir, relativePath);
    await stat(generatedFile);
    return true;
  } catch {
    return false;
  }
} 