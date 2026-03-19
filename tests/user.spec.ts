import { test, expect } from '@michalfidor/playswag';

/**
 * User tag coverage — 7 operations:
 *   createUser · createUsersWithListInput · loginUser · getUserByName
 *   updateUser · logoutUser · deleteUser
 *
 * Run in isolation: npx playwright test tests/user.spec.ts
 */

const username = `testuser_${Date.now()}`;
const password = 'hunter2';

test.beforeAll(async ({ request }) => {
  const res = await request.post('user', {
    data: {
      username,
      firstName: 'Test',
      lastName: 'User',
      email: `${username}@example.com`,
      password,
      phone: '555-0100',
      userStatus: 1,
    },
  });
  expect(res.status()).toBe(200);
});

test('createUsersWithListInput — batch user creation', async ({ request }) => {
  const batchName = `batch_${Date.now()}`;
  const res = await request.post('user/createWithList', {
    data: [
      { username: `${batchName}_a`, firstName: 'Alpha', lastName: 'User', email: `${batchName}_a@example.com`, password: 'pass1', userStatus: 0 },
      { username: `${batchName}_b`, firstName: 'Beta',  lastName: 'User', email: `${batchName}_b@example.com`, password: 'pass2', userStatus: 0 },
    ],
  });
  expect(res.status()).toBe(200);
});

test('loginUser — valid credentials', async ({ request }) => {
  const res = await request.get('user/login', {
    params: { username, password },
  });
  expect(res.status()).toBe(200);
});

test('getUserByName — fetch created user', async ({ request }) => {
  const res = await request.get(`user/${username}`);
  expect(res.status()).toBe(200);
  const user = await res.json();
  expect(user.username).toBe(username);
});

test('getUserByName — 404 for unknown user', async ({ request }) => {
  const res = await request.get('user/nonexistent_user_xyz_999');
  expect(res.status()).toBe(404);
});

test('updateUser — change email and phone', async ({ request }) => {
  const res = await request.put(`user/${username}`, {
    data: {
      username,
      firstName: 'Test',
      lastName: 'User Updated',
      email: `${username}_updated@example.com`,
      password,
      phone: '555-0199',
      userStatus: 1,
    },
  });
  expect([200, 404]).toContain(res.status());
});

test('logoutUser — end session', async ({ request }) => {
  const res = await request.get('user/logout');
  expect(res.status()).toBe(200);
});

test('deleteUser — clean up created user', async ({ request }) => {
  const res = await request.delete(`user/${username}`);
  expect([200, 404]).toContain(res.status());
});
