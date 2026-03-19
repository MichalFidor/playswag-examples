import { execSync } from 'node:child_process';

/**
 * Global setup: (re)start the Petstore container before every test run.
 *
 * The swaggerapi/petstore3 image uses a plain in-memory store. If a previous
 * test run deleted or mutated pre-seeded pets, the state carries over and causes
 * failures on the second run. Recreating the container guarantees a clean slate.
 *
 * Playwright runs this file once before any test worker starts.
 * The actual "wait for server ready" is handled by the `webServer` block in
 * playwright.config.ts with `reuseExistingServer: true` — which watches the
 * spec endpoint that globalSetup just brought up.
 */
export default async function globalSetup(): Promise<void> {
  execSync('docker compose stop petstore 2>/dev/null || true', { stdio: 'pipe' });
  execSync('docker compose up -d', { stdio: 'pipe' });

  const endpoint = 'http://localhost:8080/api/v3/openapi.json';
  const start = Date.now();
  const timeoutMs = 60_000;

  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return;
    } catch {
      // container not ready yet
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`[global-setup] Petstore did not become ready within ${timeoutMs / 1000}s`);
}
