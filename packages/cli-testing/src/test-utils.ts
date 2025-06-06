import { readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { glob } from 'glob';
import { diffLines } from 'diff';

export interface FileComparisonResult {
  file: string;
  matches: boolean;
  differences?: string;
  error?: string;
}

export class MonkoTestUtils {
  constructor(
    private mockDir: string,
    private generatedDir: string
  ) {}

  /**
   * Compare a single mock file with its generated counterpart
   */
  async compareFile(relativePath: string): Promise<FileComparisonResult> {
    const mockFile = join(this.mockDir, relativePath);
    const generatedFile = join(this.generatedDir, relativePath);

    try {
      const [mockContent, generatedContent] = await Promise.all([
        readFile(mockFile, 'utf-8'),
        readFile(generatedFile, 'utf-8')
      ]);

      const normalizedMock = this.normalizeContent(mockContent);
      const normalizedGenerated = this.normalizeContent(generatedContent);

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

  /**
   * Compare all files in the mock directory with their generated counterparts
   */
  async compareAllFiles(): Promise<FileComparisonResult[]> {
    const mockFiles = await glob('**/*.ts', { cwd: this.mockDir });
    const results: FileComparisonResult[] = [];

    for (const relativePath of mockFiles) {
      const result = await this.compareFile(relativePath);
      results.push(result);
    }

    return results;
  }

  /**
   * Check if a generated file exists
   */
  async fileExists(relativePath: string): Promise<boolean> {
    try {
      const generatedFile = join(this.generatedDir, relativePath);
      await stat(generatedFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all mock files that should have corresponding generated files
   */
  async getExpectedFiles(): Promise<string[]> {
    return await glob('**/*.ts', { cwd: this.mockDir });
  }

  private normalizeContent(content: string): string {
    return content
      .trim()
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\s+$/gm, '') // Remove trailing whitespace
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments  
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .split('\n')
      .filter(line => line.trim() !== '') // Remove empty lines
      .join('\n');
  }
}

/**
 * Convenient function to create test utils
 */
export function createTestUtils(mockDir: string, generatedDir: string) {
  return new MonkoTestUtils(mockDir, generatedDir);
}

/**
 * Assert that all mock files match their generated counterparts
 */
export async function expectFilesToMatch(mockDir: string, generatedDir: string) {
  const utils = createTestUtils(mockDir, generatedDir);
  const results = await utils.compareAllFiles();
  
  const failures = results.filter(r => !r.matches);
  
  if (failures.length > 0) {
    const errorMessage = failures
      .map(f => `${f.file}: ${f.error || f.differences}`)
      .join('\n\n');
    
    throw new Error(`Generated files don't match mocks:\n\n${errorMessage}`);
  }
  
  return results;
} 