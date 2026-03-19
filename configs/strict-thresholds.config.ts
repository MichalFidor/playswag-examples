/**
 * Alternative config: strict per-dimension quality gates.
 *
 * This config runs the full suite (core + error-paths) against tight
 * per-dimension thresholds. Each dimension carries its own { min, fail }
 * pair so it can fail the run independently of the others.
 *
 * Compare with playwright.config.ts which uses a coarser top-level
 * `failOnThreshold: true` that applies the same policy to every dimension
 * that has a `threshold` entry. Here each dimension opts in individually.
 *
 * Run: npx playwright test --config configs/strict-thresholds.config.ts
 */
import { defineConfig } from '@michalfidor/playswag';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

export default defineConfig({
  testDir: resolve(rootDir, 'tests'),
  testMatch: ['**/pets.spec.ts', '**/store.spec.ts', '**/user.spec.ts', '**/error-paths.spec.ts'],

  globalSetup: resolve(rootDir, 'global-setup.ts'),
  workers: 1,

  reporter: [
    [
      '@michalfidor/playswag/reporter',
      {
        specs: resolve(rootDir, 'specs/petstore.json'),
        outputDir: resolve(rootDir, 'playswag-report/strict-thresholds'),
        outputFormats: ['console', 'json'],

        /**
         * Per-dimension threshold syntax: { min, fail }.
         * Each entry sets its own minimum and controls whether that dimension
         * alone fails the run — no top-level failOnThreshold needed.
         */
        threshold: {
          endpoints:          { min: 90, fail: true },
          statusCodes:        { min: 50, fail: true },
          parameters:         { min: 90, fail: true },
          bodyProperties:     { min: 60, fail: true },
          responseProperties: { min: 50, fail: true },
        },

        consoleOutput: {
          showTags:                true,
          showStatusCodeBreakdown: true,
          showOperationId:         true,
        },
      },
    ],
  ],

  use: {
    baseURL: 'http://localhost:8080/api/v3/',
    extraHTTPHeaders: { api_key: 'special-key' },
  },
});
