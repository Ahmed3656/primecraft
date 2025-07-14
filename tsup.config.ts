import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  outDir: 'dist',
  splitting: false,
  clean: true,
  dts: true,
  format: ['esm'],
  target: 'node18',
  bundle: true,
  cjsInterop: true,
});
