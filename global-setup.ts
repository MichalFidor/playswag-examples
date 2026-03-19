import { execSync } from 'node:child_process';

/**
 * Global setup: (re)start the Petstore container before every test run.
 *
 * The swaggerapi/petstore3 image uses a plain in-memory store. If a previous
 * test run deleted or mutated pre-seeded pets, the state carries over and causes
 * failures on the second run. Recreating the container guarantees a clean slate.
 *
 * This file is the sole owner of container lifecycle. There is no webServer
 * block in playwright.config.ts because `docker compose up -d` exits
 * immediately (detached), which Playwright misreads as a crashed server.
 * global-setup runs before any test worker starts and blocks until the
 * endpoint is actually reachable.
 */
export default async function globalSetup(): Promise<void> {
  execSync('docker compose stop petstore 2>/dev/null || true', { stdio: 'pipe' });
  execSync('docker compose up -d', { stdio: 'pipe' });

  const endpoint = 'http://localhost:8080/api/v3/openapi.json';
  const start = Date.now();
  const timeoutMs = 120_000;

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
