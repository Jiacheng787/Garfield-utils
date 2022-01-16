import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'node:path';

const resolveBabelConfig = path.resolve(__dirname, './babel.config.js');

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      getBabelOutputPlugin({ configFile: resolveBabelConfig })
    ],
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      getBabelOutputPlugin({ configFile: resolveBabelConfig })
    ],
  },
];
