import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

function readUtf8(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

test('platform contract crates exist', () => {
  readUtf8('crates/sdkwork-assets-contract/Cargo.toml');
  readUtf8('crates/sdkwork-assets-ingestion/Cargo.toml');
  readUtf8('crates/sdkwork-assets-ingestion-drive/Cargo.toml');
  readUtf8('crates/sdkwork-assets-bridge-image/Cargo.toml');
  readUtf8('apps/sdkwork-assets-common/packages/sdkwork-assets-core/package.json');
  readUtf8('docs/architecture/tech/TECH-UNIFIED-ASSETS-PLATFORM.md');

  const component = JSON.parse(readUtf8('specs/component.spec.json'));
  assert.equal(component.component.capability, 'assets');
  assert.ok(component.component.surfaces.platform.crates.includes('crates/sdkwork-assets-contract'));
  assert.ok(component.component.surfaces.platform.crates.includes('crates/sdkwork-assets-ingestion-drive'));
});

test('ingestion documents clawrouter integration boundary', () => {
  const source = readUtf8('crates/sdkwork-assets-ingestion/src/clawrouter.rs');
  assert.match(source, /clawrouter_open_sdk/);
  assert.match(source, /sdkwork-image-claw-router-provider-service/);
});

test('assets-core exports canonical MediaResource fields', () => {
  const source = readUtf8('apps/sdkwork-assets-common/packages/sdkwork-assets-core/src/mediaResource.ts');
  assert.match(source, /kind: MediaKind/);
  assert.match(source, /source: MediaSource/);
  assert.match(source, /ai\?: MediaAiProvenance/);
  assert.match(source, /variants\?: MediaResource\[\]/);
  assert.doesNotMatch(source, /mediaResourceId/);
});

test('assets-core provides catalog mapping helpers', () => {
  const source = readUtf8('apps/sdkwork-assets-common/packages/sdkwork-assets-core/src/assetMapping.ts');
  assert.match(source, /mediaKindToAssetKind/);
  assert.match(source, /assetItemToMediaResource/);
});
