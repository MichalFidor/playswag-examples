/**
 * Lean tracking demonstration — run under the `lean` Playwright project.
 *
 * The `lean` project sets `captureResponseBody: false` in its `use` block.
 * Every request is still recorded: endpoint, status code, parameters, and
 * request body fields all contribute to coverage. The difference is that
 * response bodies are discarded immediately after each call, so response
 * property coverage shows 0 % for these hits.
 *
 * Use this pattern when:
 *   - tests poll an endpoint frequently and capturing every response body
 *     would waste memory or slow things down
 *   - responses are binary or too large to be worth analysing
 *   - another project already covers response shapes for the same endpoints
 *
 * Run: npx playwright test tests/lean.spec.ts --project lean
 */
import { test, expect } from '@michalfidor/playswag';

test('getInventory — endpoint covered, response body discarded', async ({ request }) => {
  const res = await request.get('store/inventory');
  expect(res.status()).toBe(200);
});

test('findPetsByStatus (sold) — covered, no response body', async ({ request }) => {
  const res = await request.get('pet/findByStatus', {
    params: { status: 'sold' },
  });
  expect(res.status()).toBe(200);
});

test('findPetsByStatus (pending) — covered, no response body', async ({ request }) => {
  const res = await request.get('pet/findByStatus', {
    params: { status: 'pending' },
  });
  expect(res.status()).toBe(200);
});

test('logoutUser — covered, no response body', async ({ request }) => {
  const res = await request.get('user/logout');
  expect(res.status()).toBe(200);
});
