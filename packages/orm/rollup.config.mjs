import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import glob from 'fast-glob';
const EXTERNAL_DEPS = [
    "zod",
]

const entryPoints = glob.sync(`src/**/*.ts`, { absolute: true });

export default [
  {
    input: entryPoints,
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external: [...EXTERNAL_DEPS],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json', declaration: false, declarationMap: false }),
      terser()
    ]
  },
  {
    input: entryPoints,
    output: {
      dir: 'dist',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src'
    },
    external: [...EXTERNAL_DEPS],
    plugins: [dts()]
  }
];
