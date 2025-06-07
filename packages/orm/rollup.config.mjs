import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import glob from 'fast-glob';
import path from 'path';

const EXTERNAL_DEPS = [
    "zod",
    "mongodb",
];

// Get all index.ts files for subpath exports
const subpathIndexFiles = glob.sync(`src/*/index.ts`);

// Create entry points for subpath exports (e.g., config/index.ts -> config)
const subpathEntries = subpathIndexFiles.reduce((acc, file) => {
  const relativePath = path.relative('src', file);
  const dirName = path.dirname(relativePath);
  acc[dirName] = file;
  return acc;
}, {});

// Main entry point
const mainEntry = { index: 'src/index.ts' };

// Combine all entries
const entries = { ...mainEntry, ...subpathEntries };

export default [
  // Single build phase with both JS and declarations
  {
    input: entries,
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      entryFileNames: (chunkInfo) => {
        // Put the main index.js at the root, subpath exports in subdirectories
        return chunkInfo.name === 'index' ? 'index.js' : '[name]/index.js';
      },
      chunkFileNames: 'chunks/[name]-[hash].js'
    },
    external: [...EXTERNAL_DEPS],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationMap: true,
        inlineSources: true
      }),
      terser()
    ]
  }
];
