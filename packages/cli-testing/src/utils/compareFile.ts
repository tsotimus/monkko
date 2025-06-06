import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { diffLines } from 'diff';
import { normalizeContent } from './normalizeContent';

export interface FileComparisonResult {
  file: string;
  matches: boolean;
  differences?: string;
  error?: string;
}

/**
 * Compare a single mock file with its generated counterpart
 */
export async function compareFile(
  mockDir: string,
  generatedDir: string,
  relativePath: string
): Promise<FileComparisonResult> {
  const mockFile = join(mockDir, relativePath);
  const generatedFile = join(generatedDir, relativePath);

  try {
    const [mockContent, generatedContent] = await Promise.all([
      readFile(mockFile, 'utf-8'),
      readFile(generatedFile, 'utf-8')
    ]);

    const normalizedMock = normalizeContent(mockContent);
    const normalizedGenerated = normalizeContent(generatedContent);

    const matches = normalizedMock === normalizedGenerated;
    
    if (!matches) {
      const diff = diffLines(normalizedMock, normalizedGenerated);
      const differences = diff
        .filter(part => part.added || part.removed)
        .map(part => `${part.added ? '+' : '-'} ${part.value}`)
        .join('\n');

      return {
        file: relativePath,
        matches: false,
        differences
      };
    }

    return {
      file: relativePath,
      matches: true
    };
  } catch (error) {
    return {
      file: relativePath,
      matches: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
