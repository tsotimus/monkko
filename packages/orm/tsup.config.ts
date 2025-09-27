import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/*/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['zod', 'mongodb'],
  outDir: 'dist',
})
