import { defineConfig } from '@michalfidor/playswag';

/**
 * playswag-examples — Swagger Petstore v3 coverage demo.
 *
 * Run: npm test
 *
 * global-setup.ts restarts the Docker container before each suite to ensure
 * the petstore in-memory store is clean. webServer then waits for the URL to
 * be accessible before the first worker starts.
 */
export default defineConfig({
  testDir: './tests',

  globalSetup: './global-setup.ts',

  /**
   * Run tests sequentially. The Petstore container uses an in-memory store
   * that is not safe under concurrent writes (parallel workers corrupt its
   * state). Sequential execution also keeps the coverage story cleaner:
   * pets → store → user, each file sees a fresh set of operations.
   */
  workers: 1,

  /**
   * Two Playwright projects show different fixture-option configurations.
   *
   * core            — main API tests, full tracking (captureResponseBody: true).
   *
   * fixture-options — shows how test.use({ playswagEnabled: false }) and
   *                   test.use({ captureResponseBody: false }) change what
   *                   playswag records, without changing what Playwright does.
   */
  projects: [
    {
      name: 'core',
      testMatch: ['**/pets.spec.ts', '**/store.spec.ts', '**/user.spec.ts'],
    },
    {
      name: 'fixture-options',
      testMatch: ['**/fixture-options.spec.ts'],
    },
  ],

  reporter: [
    [
      '@michalfidor/playswag/reporter',
      {
        /**
         * Vendored OAS3 spec (matches what swaggerapi/petstore3 serves at
         * http://localhost:8080/api/v3/openapi.json).
         * Run `npm run refresh-spec` to update it from a live container.
         */
        specs: './specs/petstore.json',

        outputDir: './playswag-report',

        /**
         * All five output formats enabled simultaneously so you can see every
         * kind of report after a single test run.
         */
        outputFormats: ['console', 'json', 'html', 'markdown', 'badge'],

        /**
         * History persists a slim entry after every run.
         * After two runs you get ↑/↓ delta indicators in the console and HTML.
         */
        history: { enabled: true },

        /**
         * Thresholds are intentionally set at levels the full suite passes
         * but a partial suite (e.g. pets only) fails.
         * Try removing store.spec.ts and running again — you'll see exit code 1.
         */
        threshold: {
          endpoints:   { min: 80, fail: true },
          statusCodes: { min: 55, fail: true },
        },
        failOnThreshold: true,

        consoleOutput: {
          showTags:                true,
          showStatusCodeBreakdown: true,
          showOperationId:         true,
        },

        htmlOutput: { title: 'Petstore API Coverage' },

        markdownOutput: { showUncoveredOperations: true },

        githubActionsOutput: { showUncoveredOperations: true },
      },
    ],
  ],

  use: {
    /**
     * The Petstore API sits under /api/v3 — set as base so tests can call
     * request.get('pet') instead of the full URL.
     */
    baseURL: 'http://localhost:8080/api/v3/',

    /**
     * api_key header is documented in the spec and expected by some endpoints.
     * The petstore3 Docker image doesn't enforce auth, but being explicit here
     * mirrors real-world usage and exercises the header parameter in coverage.
     */
    extraHTTPHeaders: {
      'api_key': 'special-key',
    },
  },

});
