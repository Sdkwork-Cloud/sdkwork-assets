import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(repoRoot, '..');

function readUtf8(absolutePath) {
  return fs.readFileSync(absolutePath, 'utf8');
}

test('image-contracts re-exports assets-core instead of forking MediaResource', () => {
  const source = readUtf8(path.join(
    workspaceRoot,
    'sdkwork-image/apps/sdkwork-image-common/packages/sdkwork-image-contracts/src/index.ts',
  ));
  assert.match(source, /@sdkwork\/assets-core/);
  assert.match(source, /MediaResource as SdkworkMediaResource/);
  assert.doesNotMatch(source, /export interface SdkworkMediaResource/);
});

test('generations history consumes assets-pc-commons MediaResource', () => {
  const source = readUtf8(path.join(
    workspaceRoot,
    'sdkwork-generations/apps/sdkwork-generations-pc/packages/sdkwork-generations-pc-workspace/src/generation-history.ts',
  ));
  assert.match(source, /@sdkwork\/assets-pc-commons/);
  assert.match(source, /readMediaResourceUrl/);
  assert.doesNotMatch(source, /export interface SdkworkMediaResource/);
});

test('drive OpenAPI MediaResource aligns with MEDIA_RESOURCE_SPEC kind enum', () => {
  const openapi = readUtf8(path.join(
    workspaceRoot,
    'sdkwork-drive/apis/app-api/drive/drive-app-api.openapi.json',
  ));
  const kindEnum = openapi.match(
    /"MediaResource": \{[\s\S]*?"kind": \{[\s\S]*?"enum": \[([\s\S]*?)\]/,
  );
  assert.ok(kindEnum, 'MediaResource.kind enum must exist');
  assert.match(kindEnum[1], /"voice"/);
  assert.match(kindEnum[1], /"model"/);
  assert.doesNotMatch(kindEnum[1], /"folder"/);
  assert.match(openapi, /"durationSeconds"/);
});

test('image pnpm workspace links canonical assets-core package', () => {
  const workspace = readUtf8(path.join(workspaceRoot, 'sdkwork-image/pnpm-workspace.yaml'));
  assert.match(workspace, /sdkwork-assets\/packages\/sdkwork-assets-core/);
});
