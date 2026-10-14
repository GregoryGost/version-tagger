import { defineConfig } from 'tsup';

export default defineConfig({
  outDir: 'dist',
  entry: ['src/index.ts'],
  target: 'esnext',
  format: ['cjs'],
  // A GitHub Action runs the checked-in dist/index.js without node_modules.
  noExternal: ['@actions/core', '@actions/github', 'semver'],
  minify: true,
  treeshake: true,
  clean: true,
  splitting: false,
  sourcemap: false,
  dts: false
});
