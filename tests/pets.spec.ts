import { test, expect } from '@michalfidor/playswag';

/**
 * Pet tag coverage — 8 operations:
 *   addPet · findPetsByStatus · findPetsByTags · getPetById · updatePet
 *   updatePetWithForm · deletePet · uploadFile
 *
 * `beforeAll` attempts to create a fresh pet. The swaggerapi/petstore3 image
 * has known write-operation failures under ARM64 (Apple Silicon) emulation;
 * when addPet returns non-200 the suite uses pre-seeded pet ID 1 (always
 * present on a fresh container). All endpoints are still called so playswag
 * records coverage regardless of which ID is used.
 *
 * Run in isolation: npx playwright test tests/pets.spec.ts
 */

let petId: number;

test.beforeAll(async ({ request }) => {
  const create = await request.post('pet', {
    data: {
      name: 'Buddy',
      photoUrls: ['https://example.com/buddy.jpg'],
      category: { id: 1, name: 'Dogs' },
      tags: [{ id: 1, name: 'friendly' }, { id: 2, name: 'dog' }],
      status: 'available',
    },
  });

  if (create.status() === 200) {
    petId = (await create.json()).id;
  } else {
    petId = 1;
  }
});

test('findPetsByStatus — available pets', async ({ request }) => {
  const res = await request.get('pet/findByStatus', {
    params: { status: 'available' },
  });
  expect(res.status()).toBe(200);
  const pets = await res.json();
  expect(Array.isArray(pets)).toBe(true);
});

test('findPetsByTags — filter by tags', async ({ request }) => {
  const res = await request.get('pet/findByTags', {
    params: { tags: ['dog', 'friendly'] },
  });
  expect(res.status()).toBe(200);
  const pets = await res.json();
  expect(Array.isArray(pets)).toBe(true);
});

test('getPetById — fetch pet', async ({ request }) => {
  const res = await request.get(`pet/${petId}`);
  expect(res.status()).toBe(200);
  const pet = await res.json();
  expect(pet.id).toBe(petId);
});

test('getPetById — 400 for non-numeric id', async ({ request }) => {
  const res = await request.get('pet/not-a-number');
  expect(res.status()).toBe(400);
});

test('getPetById — 404 for unknown id', async ({ request }) => {
  const res = await request.get('pet/999999999987654321');
  expect(res.status()).toBe(404);
});

test('updatePet — change name and status', async ({ request }) => {
  const res = await request.put('pet', {
    data: {
      id: petId,
      name: 'Buddy Updated',
      photoUrls: ['https://example.com/buddy.jpg'],
      status: 'pending',
    },
  });
  expect([200, 404, 422, 500]).toContain(res.status());
});

test('updatePetWithForm — update name via query params', async ({ request }) => {
  const res = await request.post(`pet/${petId}`, {
    params: { name: 'Buddy Form Updated', status: 'sold' },
  });
  expect([200, 400, 405]).toContain(res.status());
});

test('uploadFile — upload an image for a pet', async ({ request }) => {
  const res = await request.post(`pet/${petId}/uploadImage`, {
    params: { additionalMetadata: 'profile-photo' },
    multipart: { file: { name: 'photo.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-image') } },
  });
  expect([200, 415]).toContain(res.status());
});

test('findPetsByStatus — 400 for invalid status value', async ({ request }) => {
  const res = await request.get('pet/findByStatus', {
    params: { status: 'not-a-real-status' },
  });
  expect(res.status()).toBe(400);
});

test('deletePet — delete pet', async ({ request }) => {
  const res = await request.delete(`pet/${petId}`, {
    headers: { api_key: 'special-key' },
  });
  expect([200, 400, 500]).toContain(res.status());
});
