import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(appRoot, '../..');

function exists(targetPath) {
  return fs.existsSync(targetPath);
}

function resolveSpawnCommand(command) {
  if (process.platform === 'win32' && command === 'pnpm') {
    return 'pnpm.cmd';
  }
  return command;
}

function run(command, args, cwd) {
  const result = spawnSync(resolveSpawnCommand(command), args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    windowsHide: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function shouldBuildPackage(packageRoot) {
  const distEntry = path.join(packageRoot, 'dist', 'index.js');
  if (!exists(distEntry)) {
    return true;
  }
  const sourceMtime = fs.statSync(path.join(packageRoot, 'src')).mtimeMs;
  const distMtime = fs.statSync(distEntry).mtimeMs;
  return sourceMtime > distMtime;
}

const sharedSdkCommonRoot = path.resolve(
  repoRoot,
  '../sdkwork-sdk-commons/sdkwork-sdk-common-typescript',
);

if (!exists(sharedSdkCommonRoot)) {
  console.error(`[prepare-shared-sdk] Missing @sdkwork/sdk-common at ${sharedSdkCommonRoot}`);
  process.exit(1);
}

if (shouldBuildPackage(sharedSdkCommonRoot)) {
  console.log('[prepare-shared-sdk] Building @sdkwork/sdk-common');
  run('pnpm', ['--filter', '@sdkwork/sdk-common', 'build'], repoRoot);
} else {
  console.log('[prepare-shared-sdk] @sdkwork/sdk-common is up to date');
}
