import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const requiredRootFiles = [
  'README.md',
  'AGENTS.md',
  'package.json',
  'pnpm-workspace.yaml',
  'specs/topology.spec.json',
  'specs/architecture-alignment.md',
  'specs/GOVERNANCE_EXCEPTIONS.md',
];

function readUtf8(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  assert.equal(fs.existsSync(fullPath), true, `Expected ${relativePath} to exist`);
  return fs.readFileSync(fullPath, 'utf8');
}

test('repository root documents unified asset platform layout', () => {
  for (const relativePath of requiredRootFiles) {
    readUtf8(relativePath);
  }

  const readme = readUtf8('README.md');
  assert.match(readme, /sdkwork-drive/);
  assert.match(readme, /sdkwork-assets-core/);
  assert.match(readme, /Unified Asset Management/);
  readUtf8('Cargo.toml');
  readUtf8('specs/component.spec.json');
  readUtf8('sdkwork.workflow.json');
  readUtf8('.github/workflows/package.yml');
  readUtf8('packages/sdkwork-assets-core/package.json');
});

test('workspace links drive app sdk and utils', () => {
  const workspace = readUtf8('pnpm-workspace.yaml');
  assert.match(workspace, /sdkwork-drive-app-sdk-typescript/);
  assert.match(workspace, /sdkwork-utils-typescript/);
});

test('pc react app root exists with component spec', () => {
  readUtf8('apps/sdkwork-assets-pc/sdkwork.app.config.json');
  const manifest = JSON.parse(readUtf8('apps/sdkwork-assets-pc/specs/component.spec.json'));
  assert.equal(manifest.component.domain, 'content');
  assert.equal(manifest.component.capability, 'assets');
});

test('mobile placeholders are reserved under apps/', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'apps/sdkwork-assets-h5/.gitkeep')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'apps/sdkwork-assets-flutter-mobile/.gitkeep')), true);
});

test('pc application root follows apps/sdkwork-assets-pc layout', () => {
  readUtf8('apps/sdkwork-assets-pc/README.md');
  readUtf8('apps/sdkwork-assets-pc/vite.config.ts');
  assert.equal(fs.existsSync(path.join(repoRoot, 'apps/sdkwork-assets-pc/packages')), true);
  assert.equal(fs.existsSync(path.join(repoRoot, 'sdkwork-assets-pc-react')), false);
});
