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

test('ingestion-drive maps upload profile codes to drive-supported values', () => {
  const source = readUtf8('crates/sdkwork-assets-ingestion-drive/src/lib.rs');
  assert.match(source, /upload_profile_code: item\.upload_profile_code/);
  assert.match(source, /UploaderTarget::AiGeneratedSpace/);
  assert.match(source, /source: Some\("ai_generated"/);
});

test('image runtime service orchestrates provider dispatch and drive import', () => {
  readUtf8('../sdkwork-image/crates/sdkwork-image-generation-runtime-service/Cargo.toml');
  const source = readUtf8('../sdkwork-image/crates/sdkwork-image-generation-runtime-service/src/orchestration.rs');
  assert.match(source, /dispatch_image_generation_provider/);
  assert.match(source, /plan_drive_upload_preparations/);
});
