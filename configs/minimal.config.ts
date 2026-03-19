/**
 * Alternative config: minimal setup — just specs, an output dir, and console.
 *
 * The simplest valid playswag reporter configuration. No thresholds, no
 * output files, no history. Good as a starting point when adding playswag
 * to an existing project for the first time, or as a reference for copy-
 * pasting only the fields you actually need.
 *
 * Run: npx playwright test --config configs/minimal.config.ts
 */
import { defineConfig } from '@michalfidor/playswag';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

export default defineConfig({
  testDir: resolve(rootDir, 'tests'),
  testMatch: ['**/pets.spec.ts', '**/store.spec.ts', '**/user.spec.ts'],

  globalSetup: resolve(rootDir, 'global-setup.ts'),
  workers: 1,

  reporter: [
    [
      '@michalfidor/playswag/reporter',
      {
        specs: resolve(rootDir, 'specs/petstore.json'),
        outputDir: resolve(rootDir, 'playswag-report/minimal'),
        outputFormats: ['console'],
      },
    ],
  ],

  use: {
    baseURL: 'http://localhost:8080/api/v3/',
    extraHTTPHeaders: { api_key: 'special-key' },
  },
});
