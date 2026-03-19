import { test, expect } from '@michalfidor/playswag';

/**
 * Store tag coverage — 4 operations:
 *   getInventory · placeOrder · getOrderById · deleteOrder
 *
 * Run in isolation: npx playwright test tests/store.spec.ts
 */

let orderId: number;

test.beforeAll(async ({ request }) => {
  const res = await request.post('store/order', {
    data: {
      petId: 1,
      quantity: 2,
      status: 'placed',
      complete: false,
    },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  orderId = body.id;
});

test('getInventory — pet counts by status', async ({ request }) => {
  const res = await request.get('store/inventory');
  expect(res.status()).toBe(200);
  const inventory = await res.json();
  expect(typeof inventory).toBe('object');
});

test('placeOrder — create a new order', async ({ request }) => {
  const res = await request.post('store/order', {
    data: {
      petId: 2,
      quantity: 1,
      shipDate: new Date().toISOString(),
      status: 'approved',
      complete: true,
    },
  });
  expect(res.status()).toBe(200);
  const order = await res.json();
  expect(order.petId).toBe(2);
  expect(order.status).toBe('approved');
});

test('getOrderById — fetch created order', async ({ request }) => {
  const res = await request.get(`store/order/${orderId}`);
  expect(res.status()).toBe(200);
  const order = await res.json();
  expect(order.id).toBe(orderId);
});

test('getOrderById — 404 for unknown order', async ({ request }) => {
  const res = await request.get('store/order/999999999');
  expect(res.status()).toBe(404);
});

test('deleteOrder — clean up created order', async ({ request }) => {
  const res = await request.delete(`store/order/${orderId}`);
  expect([200, 404]).toContain(res.status());
});
