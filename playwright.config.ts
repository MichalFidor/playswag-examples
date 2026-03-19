import { defineConfig } from '@playwright/test';

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

  // ── playswag reporter ──────────────────────────────────────────────────────
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

        // Console extras
        consoleOutput: {
          showTags:               true,  // per-tag summary table
          showStatusCodeBreakdown: true, // breakdown by HTTP status code
          showOperationId:        true,  // show operationId next to path
        },

        // HTML
        htmlOutput: { title: 'Petstore API Coverage' },

        // Markdown — uncovered ops listed at the bottom
        markdownOutput: { showUncoveredOperations: true },

        // GitHub Actions step summary
        githubActionsOutput: { showUncoveredOperations: true },
      },
    ],
  ],

  // ── Playwright use block ───────────────────────────────────────────────────
  use: {
    /**
     * The Petstore API sits under /api/v3 — set as base so tests can call
     * request.get('/pet') instead of the full URL.
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

  // ── Automatic Petstore startup ─────────────────────────────────────────────
  webServer: {
    /**
     * global-setup.ts already started the container. This block simply polls
     * the spec endpoint until the server is ready to accept requests, giving
     * Playwright a clean integration point with Docker's startup time.
     *
     * On first run (no container yet) Docker pulls the image and starts it;
     * on subsequent runs global-setup stops and recreates it for a clean state.
     */
    command: 'docker compose up -d',
    url: 'http://localhost:8080/api/v3/openapi.json',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
