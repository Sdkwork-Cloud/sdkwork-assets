import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

test('assets app OpenAPI owns global assets routes', () => {
  const openapi = readJson('apis/app-api/assets/assets-app-api.openapi.json');
  assert.equal(openapi.info['x-sdkwork-owner'], 'sdkwork-assets');
  assert.equal(openapi.info['x-sdkwork-api-authority'], 'sdkwork-assets-app-api');
  assert.ok(openapi.paths['/app/v3/api/assets']?.get?.operationId === 'assets.list');
  assert.ok(openapi.paths['/app/v3/api/assets']?.post?.operationId === 'assets.create');
});

test('drive app OpenAPI no longer exposes global assets routes', () => {
  const openapi = readJson('../sdkwork-drive/apis/app-api/drive/drive-app-api.openapi.json');
  for (const pathKey of Object.keys(openapi.paths || {})) {
    assert.ok(!pathKey.startsWith('/app/v3/api/assets'), `drive must not own ${pathKey}`);
  }
});
