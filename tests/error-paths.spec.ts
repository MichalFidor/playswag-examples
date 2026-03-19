/**
 * Error-path coverage — deliberately exercises 4xx responses across all three tags.
 *
 * The core suite (pets/store/user) focuses on happy paths. This file fills in
 * the missing error branches so the status code dimension improves without
 * cluttering the primary specs with negative cases.
 *
 * These tests are matched by the `error-paths` Playwright project in
 * playwright.config.ts and contribute to the shared playswag coverage report
 * alongside the core suite.
 *
 * Run in isolation: npx playwright test tests/error-paths.spec.ts
 */
import { test, expect } from '@michalfidor/playswag';

test('loginUser — 400 when required params are absent', async ({ request }) => {
  const res = await request.get('user/login');
  expect(res.status()).toBe(400);
});

test('deleteOrder — 400 for non-numeric order ID', async ({ request }) => {
  const res = await request.delete('store/order/not-a-number');
  expect(res.status()).toBe(400);
});

test('deleteUser — 404 for unknown username', async ({ request }) => {
  const res = await request.delete('user/no_such_user_xyz_99999');
  expect(res.status()).toBe(404);
});

test('updateUser — 404 for unknown username', async ({ request }) => {
  const res = await request.put('user/no_such_user_xyz_99999', {
    data: {
      username: 'no_such_user_xyz_99999',
      firstName: 'Ghost',
      lastName: 'User',
      email: 'ghost@example.com',
      password: 'password',
      phone: '000-0000',
      userStatus: 0,
    },
  });
  expect(res.status()).toBe(404);
});
