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
   * Four Playwright projects, each demonstrating a different aspect of
   * playswag fixture configuration.
   *
   * core            — full tracking of the three primary spec files.
   *
   * error-paths     — a dedicated suite of tests that deliberately trigger
   *                   4xx responses to fill in status code coverage gaps.
   *                   Keeping these separate makes the intent explicit and
   *                   keeps the happy-path specs clean.
   *
   * lean            — captureResponseBody: false at the project level.
   *                   Endpoints, status codes, params, and request body
   *                   fields are still recorded; response bodies are
   *                   discarded. Useful for polling tests or large payloads.
   *
   * fixture-options — test.use() per-describe overrides: playswagEnabled: false
   *                   (calls not recorded at all) and captureResponseBody: false
   *                   (calls recorded without response body) — see also the
   *                   same options applied at project level in `lean` above.
   */
  projects: [
    {
      name: 'core',
      testMatch: ['**/pets.spec.ts', '**/store.spec.ts', '**/user.spec.ts'],
    },
    {
      name: 'error-paths',
      testMatch: ['**/error-paths.spec.ts'],
    },
    {
      name: 'lean',
      testMatch: ['**/lean.spec.ts'],
      use: { captureResponseBody: false },
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
