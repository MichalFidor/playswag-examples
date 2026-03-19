# GitHub Copilot Instructions for `playswag-examples`

## Project Overview

This is a standalone showcase and tutorial repo for [playswag](https://github.com/MichalFidor/playswag),
demonstrating real-world API coverage tracking against the
[Swagger Petstore v3](https://github.com/swagger-api/swagger-petstore) Docker container.

The repo has two roles simultaneously:
- **Showcase** — a working example of every playswag reporter option in a real project
- **Tutorial** — the README walks readers through adding playswag to their own suite

---

## Key Technical Setup

### URL resolution

Playwright's `baseURL` must end with a trailing slash so relative paths resolve correctly:

```ts
use: { baseURL: 'http://localhost:8080/api/v3/' }
```

All requests in tests use paths **without a leading slash** (e.g. `request.get('pet/findByStatus')`),
not `request.get('/pet/findByStatus')`. A leading slash resets resolution to the origin,
turning `http://localhost:8080/api/v3/` into `http://localhost:8080/pet/findByStatus`.

### Coverage fixture

Tests must import `test` and `expect` from `@michalfidor/playswag`, not `@playwright/test`:

```ts
import { test, expect } from '@michalfidor/playswag';
```

This wraps the built-in `request` fixture with a transparent proxy that records each HTTP call
so the playswag reporter can build the coverage report.

### playswag config import

`playwright.config.ts` imports `defineConfig` from `@playwright/test` directly (native typing is
fine here — playswag's re-exported `defineConfig` is only needed when using `playswagSpecs` or
other per-project use options).

### serverBasePath matching

The vendored spec at `specs/petstore.json` has `"servers": [{ "url": "http://localhost:8080/api/v3" }]`.
playswag's matcher extracts `/api/v3` as `serverBasePath` and strips it before matching recorded
URLs against spec paths. No additional `playswagBaseURL` is required.

---

## Repository Layout

```
specs/
  petstore.json          – vendored OAS3 spec (committed, refreshed by npm run refresh-spec)
  README.md              – provenance note

tests/
  pets.spec.ts           – pet tag: addPet, findByStatus, findByTags, getPetById,
                           updatePet, updatePetWithForm, uploadFile, deletePet
  store.spec.ts          – store tag: getInventory, placeOrder, getOrderById, deleteOrder
  user.spec.ts           – user tag: createUser, createUsersWithListInput, loginUser,
                           getUserByName, updateUser, logoutUser, deleteUser

scripts/
  refresh-spec.mjs       – re-downloads live spec from a running container

.github/
  workflows/ci.yml       – GitHub Actions: push + daily cron, uploads coverage artifact

playwright.config.ts     – full playswag reporter configuration
docker-compose.yml       – swaggerapi/petstore3:latest on port 8080
tsconfig.json
```

---

## Running locally

```bash
npm install
npx playwright install --with-deps
npm test
```

`global-setup.ts` recreates the Docker container before every test run to guarantee a clean
in-memory petstore state. `docker compose stop petstore && docker compose up -d` is called
programmatically so you do not need to manage the container manually.

---

## Conventions

- **No inline `//` comments** in `.ts` source files. Explanations belong here or in file-level
  JSDoc blocks (`/** ... */` at the top of the file).
- **No `describe` wrappers** — each spec file is a flat list of `test()` calls. The file name
  already provides the grouping context.
- **`test.beforeAll` for shared setup** — create a pet / place an order once, save the ID to a
  module-level variable, use it across all tests in the file.
- **Unique identifiers via `Date.now()`** — usernames and batch names include a timestamp suffix
  to avoid conflicts between concurrent or repeated runs.
- **Graceful status assertions** — for destructive operations that may race (`DELETE`, `PUT`),
  accept `[200, 404]` rather than hard-coding a single status code.
- **`workers: 1`** — the Petstore container uses a plain Java `HashMap` as its
  in-memory store. Concurrent writes from multiple Playwright workers corrupt its
  state. Sequential test execution is the correct approach for this target API.
- **Port 8080** is reserved for the Petstore container. Do not use it for anything else.
- **ARM64 / Apple Silicon note** — `swaggerapi/petstore3:latest` is an amd64-only image.
  Under QEMU emulation pet write operations (`POST /pet`, `PUT /pet`, `DELETE /pet/{id}`)
  may return 500. `pets.spec.ts` handles this by falling back to a pre-seeded sample pet
  for `beforeAll` and uses relaxed status assertions (`[200, 500]`) for write-heavy tests.
  All 8 pet endpoints are still called so endpoint coverage is recorded correctly.
- **`playswag-report/`** — generated output directory. Badge SVG, markdown, and HTML
  are committed (self-contained; CI updates them on every main push). JSON coverage
  data, history, and JUnit XML are gitignored.

---

## Coverage targets

| Dimension | Threshold | Fail on miss |
|-----------|-----------|-------------|
| Endpoints | ≥ 80 % | yes |
| Status codes | ≥ 55 % | yes |
| Parameters | — | no |
| Body properties | — | no |
| Response properties | — | no |

Running all three test files should exceed both thresholds. Running only `pets.spec.ts` in
isolation intentionally fails them — this is used in the tutorial to illustrate the threshold
feature.

---

## Adding a new test

1. Create or extend a file in `tests/`.
2. Import `import { test, expect } from '@michalfidor/playswag';`.
3. Use paths without a leading slash: `request.get('pet/findByStatus', ...)`.
4. If the spec grows (e.g. a new Petstore image), run `npm run refresh-spec` to update
   `specs/petstore.json` and commit the result.
