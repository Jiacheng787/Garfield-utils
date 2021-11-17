import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
    },
    plugins: [resolve(), commonjs(), typescript()],
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
    },
    plugins: [resolve(), commonjs(), typescript()],
  },
];
