import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist/es',
      format: 'es',
      entryFileNames: 'index.mjs',
      name: 'softTooltips',
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      entryFileNames: 'index.cjs',
      name: 'softTooltips',
    },
    {
      file: 'dist/bundle.iife.js',
      format: 'iife',
      name: 'softTooltips',
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'softTooltips',
    },
  ],
  plugins: [
    typescript({ tsconfig: 'tsconfig.json' }),
    postcss({
      extract: false, // Optional: extracts CSS to a separate file instead of inline
      minimize: true, // Optional: minifies CSS
    }),
  ],
});
