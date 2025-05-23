import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import glob from 'fast-glob';
import path from 'path';

const EXTERNAL_DEPS = [
    "zod",
    "mongodb",
];

// Get all index.ts files for subpath exports
const subpathIndexFiles = glob.sync(`src/*/index.ts`, { absolute: true });

// Create entry points for subpath exports (e.g., config/index.ts -> config)
const subpathEntries = subpathIndexFiles.reduce((acc, file) => {
  const relativePath = path.relative('src', file);
  const dirName = path.dirname(relativePath);
  acc[dirName] = file;
  return acc;
}, {});

// Main entry point
const mainEntry = { index: path.resolve('src/index.ts') };

// Combine all entries
const entries = { ...mainEntry, ...subpathEntries };

export default [
  // JavaScript build
  {
    input: entries,
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].js',
      chunkFileNames: 'chunks/[name]-[hash].js'
    },
    external: [...EXTERNAL_DEPS],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ 
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      terser()
    ]
  },
  // Type declarations build
  {
    input: entries,
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].d.ts',
      chunkFileNames: '[name].d.ts'
    },
    external: [...EXTERNAL_DEPS],
    plugins: [
      dts({
        respectExternal: true
      })
    ]
  }
];
