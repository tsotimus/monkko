/**
 * Normalize content for comparison by removing comments, whitespace, and empty lines
 */
export function normalizeContent(content: string): string {
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