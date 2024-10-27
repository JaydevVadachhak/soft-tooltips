import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';

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
  ],
  plugins: [typescript({ tsconfig: 'tsconfig.json' })],
});
