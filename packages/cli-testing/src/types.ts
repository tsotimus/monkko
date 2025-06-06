export interface TestCase {
  name: string;
  schemaFile: string;
  description?: string;
  expectedFiles?: string[];
}

export interface TestSuite {
  cases: TestCase[];
}

export interface ComparisonResult {
  file: string;
  matches: boolean;
  differences?: string;
  error?: string;
}

export interface TestResult {
  testCase: TestCase;
  success: boolean;
  results: ComparisonResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

export interface TestConfig {
  mockDir: string;
  generatedDir: string;
  testSuiteFile: string;
} 