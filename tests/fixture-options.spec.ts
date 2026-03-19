/**
 * Demonstrates per-test fixture options via test.use().
 *
 * playswagEnabled: false
 *   Requests are sent normally but NOT recorded by playswag. Use this for
 *   pre-flight authentication, database seeding, or teardown calls that
 *   should not contribute to API coverage metrics.
 *
 * captureResponseBody: false
 *   Endpoints, status codes, parameters, and request body fields are still
 *   recorded. The response body is discarded after the call, so response
 *   property coverage shows 0 % for these hits. Use this when you want
 *   endpoint / status coverage but do not need response shape analysis
 *   (e.g. high-frequency polling tests or large binary responses).
 *
 * Run in isolation: npx playwright test tests/fixture-options.spec.ts
 */
import { test, expect } from '@michalfidor/playswag';

test.describe('not tracked — playswagEnabled: false', () => {
  test.use({ playswagEnabled: false });

  test('loginUser — auth pre-step, not counted in coverage', async ({ request }) => {
    const res = await request.get('user/login', {
      params: { username: 'user1', password: 'XXXXXXXXXXX' },
    });
    expect([200, 400]).toContain(res.status());
  });
});

test.describe('lean tracking — captureResponseBody: false', () => {
  test.use({ captureResponseBody: false });

  test('getInventory — endpoint covered, response body discarded', async ({ request }) => {
    const res = await request.get('store/inventory');
    expect(res.status()).toBe(200);
  });

  test('findPetsByStatus — covered, no response properties captured', async ({ request }) => {
    const res = await request.get('pet/findByStatus', {
      params: { status: 'sold' },
    });
    expect(res.status()).toBe(200);
  });
});
