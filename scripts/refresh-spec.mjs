/**
 * refresh-spec.mjs
 *
 * Downloads the live OpenAPI spec from the running Petstore container and
 * overwrites specs/petstore.json with a pretty-printed copy.
 *
 * Usage:
 *   docker compose up -d        # make sure the container is running first
 *   npm run refresh-spec
 */

import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SPEC_URL = 'http://localhost:8080/api/v3/openapi.json';
const OUTPUT   = join(__dirname, '..', 'specs', 'petstore.json');

console.log(`Fetching ${SPEC_URL} …`);

let res;
try {
  res = await fetch(SPEC_URL);
} catch (err) {
  console.error(`Could not reach the Petstore container: ${err.message}`);
  console.error('Run "docker compose up -d" first.');
  process.exit(1);
}

if (!res.ok) {
  console.error(`HTTP ${res.status} ${res.statusText}`);
  process.exit(1);
}

const spec = await res.json();
await writeFile(OUTPUT, JSON.stringify(spec, null, 2) + '\n', 'utf8');
console.log(`✔  specs/petstore.json updated (${Object.keys(spec.paths ?? {}).length} paths)`);
