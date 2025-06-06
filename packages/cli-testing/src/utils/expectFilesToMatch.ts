import { compareAllFiles } from './compareAllFiles';

/**
 * Assert that all mock files match their generated counterparts
 */
export async function expectFilesToMatch(mockDir: string, generatedDir: string) {
  const results = await compareAllFiles(mockDir, generatedDir);
  
  const failures = results.filter(r => !r.matches);
  
  if (failures.length > 0) {
    const errorMessage = failures
      .map(f => `${f.file}: ${f.error || f.differences}`)
      .join('\n\n');
    
    throw new Error(`Generated files don't match mocks:\n\n${errorMessage}`);
  }
  
  return results;
} 