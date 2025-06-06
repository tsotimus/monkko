import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { glob } from 'glob';
import { diffLines, type Change } from 'diff';
import type { ComparisonResult, TestCase, TestResult } from './types.js';

export class FileValidator {
  constructor(
    private mockDir: string,
    private generatedDir: string
  ) {}

  async compareFiles(mockFile: string, generatedFile: string): Promise<ComparisonResult> {
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
          .filter((part: Change) => part.added || part.removed)
          .map((part: Change) => `${part.added ? '+' : '-'} ${part.value}`)
          .join('\n');

        return {
          file: relative(process.cwd(), generatedFile),
          matches: false,
          differences
        };
      }

      return {
        file: relative(process.cwd(), generatedFile),
        matches: true
      };
    } catch (error) {
      return {
        file: relative(process.cwd(), generatedFile),
        matches: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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

  async findFilePairs(): Promise<Array<{ mockFile: string; generatedFile: string; relativePath: string }>> {
    const mockFiles = await glob('**/*.ts', { cwd: this.mockDir });
    const pairs: Array<{ mockFile: string; generatedFile: string; relativePath: string }> = [];

    for (const relativePath of mockFiles) {
      const mockFile = join(this.mockDir, relativePath);
      const generatedFile = join(this.generatedDir, relativePath);

      try {
        await stat(generatedFile);
        pairs.push({ mockFile, generatedFile, relativePath });
      } catch {
        // Generated file doesn't exist - we'll handle this in validation
        pairs.push({ 
          mockFile, 
          generatedFile, 
          relativePath
        });
      }
    }

    return pairs;
  }

  async validateTestCase(testCase: TestCase): Promise<TestResult> {
    const filePairs = await this.findFilePairs();
    const results: ComparisonResult[] = [];

    for (const { mockFile, generatedFile, relativePath } of filePairs) {
      try {
        await stat(generatedFile);
        const result = await this.compareFiles(mockFile, generatedFile);
        results.push(result);
      } catch {
        results.push({
          file: relativePath,
          matches: false,
          error: `Generated file not found: ${generatedFile}`
        });
      }
    }

    const summary = {
      total: results.length,
      passed: results.filter(r => r.matches).length,
      failed: results.filter(r => !r.matches).length
    };

    return {
      testCase,
      success: summary.failed === 0,
      results,
      summary
    };
  }
} 