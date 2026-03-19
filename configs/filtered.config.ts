/**
 * Alternative config: include-path filter + exclude response properties dimension.
 *
 * Two reporter-level settings are demonstrated here that cannot be set per
 * Playwright project — they belong to the reporter, not the fixture.
 *
 * includePatterns: ['/pet/**']
 *   Only endpoints whose path matches the glob are counted. Calls to
 *   /store/** and /user/** still happen and all tests still pass, but those
 *   endpoints do not appear in the coverage tables or thresholds. Useful
 *   when a monorepo test suite spans multiple services and you want a
 *   service-scoped coverage snapshot without splitting the spec.
 *
 * excludeDimensions: ['responseProperties']
 *   Removes the response property dimension entirely from calculations,
 *   output, and thresholds. Response bodies are still captured (the fixture
 *   is unaffected); playswag simply does not analyse them. Use this when
 *   you do not trust or do not need to track which response fields were
 *   observed — for example, in a contract-testing setup where only the
 *   request side is under your control.
 *
 * Run: npx playwright test --config configs/filtered.config.ts
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
        outputDir: resolve(rootDir, 'playswag-report/filtered'),
        outputFormats: ['console', 'json', 'html'],

        /**
         * Only /pet/** paths appear in the report.
         * /store and /user calls are made but not counted.
         */
        includePatterns: ['/pet/**'],

        /**
         * Drop response property coverage entirely — not shown in tables,
         * not used in threshold calculations, not written to output files.
         */
        excludeDimensions: ['responseProperties'],

        htmlOutput: { title: 'Pet Endpoints — Filtered Coverage' },

        threshold: {
          endpoints: { min: 100, fail: true },
        },
      },
    ],
  ],

  use: {
    baseURL: 'http://localhost:8080/api/v3/',
    extraHTTPHeaders: { api_key: 'special-key' },
  },
});
