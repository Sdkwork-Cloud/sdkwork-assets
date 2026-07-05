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

test('architecture alignment documents framework posture', () => {
  const alignment = readUtf8('specs/architecture-alignment.md');
  assert.match(alignment, /sdkwork-web-framework/);
  assert.match(alignment, /sdkwork-database/);
  assert.match(alignment, /sdkwork-discovery/);
  assert.match(alignment, /sdkwork-utils/);
  assert.match(alignment, /sdkwork-drive/);
});

test('governance exceptions cover consumer client posture', () => {
  const governance = readUtf8('specs/GOVERNANCE_EXCEPTIONS.md');
  assert.match(governance, /EX-2026-ASSETS-001/);
  assert.match(governance, /EX-2026-ASSETS-002/);
  assert.match(governance, /EX-2026-ASSETS-003/);
});

test('assets service uses drive sdk not raw fetch', () => {
  const service = readUtf8(
    'apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/services/assetCatalogService.ts',
  );
  assert.match(service, /@sdkwork\/drive-app-sdk/);
  assert.doesNotMatch(service, /fetch\s*\(/);
});

test('asset center uses drive cursor pagination', () => {
  const hook = readUtf8(
    'apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/hooks/useAssetsListInfiniteQuery.ts',
  );
  const filters = readUtf8(
    'apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/utils/assetListFilters.ts',
  );
  const pagination = readUtf8(
    'apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/utils/assetPagination.ts',
  );
  assert.match(hook, /useInfiniteQuery/);
  assert.match(hook, /buildListAssetsQuery/);
  assert.match(filters, /kind/);
  assert.match(filters, /sourceType/);
  assert.match(pagination, /nextCursor/);
});

test('archive restore patches list cache for drive list lifecycle gap', () => {
  const cache = readUtf8(
    'apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/hooks/assetListCache.ts',
  );
  const page = readUtf8(
    'apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/pages/AssetCenterPage.tsx',
  );
  assert.match(cache, /patchAssetLifecycleInCache/);
  assert.match(page, /patchAssetLifecycleInCache/);
});

test('vite dev server proxies platform apis and applies security headers', () => {
  const vite = readUtf8('apps/sdkwork-assets-pc/vite.config.ts');
  const headers = readUtf8('apps/sdkwork-assets-pc/config/browser/securityHeaders.ts');
  assert.match(vite, /browserSecurityHeadersPlugin/);
  assert.match(vite, /\/app\/v3\/api/);
  assert.match(vite, /proxy:/);
  assert.match(headers, /Content-Security-Policy/);
});

test('iam integration is wired through appbase auth runtime', () => {
  const runtime = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-core/src/iam/assetsIamRuntime.ts');
  assert.match(runtime, /@sdkwork\/auth-runtime-pc-react/);
  assert.match(runtime, /createSdkworkAppbasePcAuthRuntime/);
});

test('auth gate uses iam session bootstrap', () => {
  const gate = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-auth/src/AssetsAuthGate.tsx');
  assert.match(gate, /bootstrapAssetsIamSession/);
  const logic = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-auth/src/assetsAuthGateLogic.ts');
  assert.match(logic, /readAssetsViteEnv/);
});

test('release workflow is configured', () => {
  readUtf8('sdkwork.workflow.json');
  readUtf8('.github/workflows/package.yml');
});

test('auth config resolves iam appearance and runtime policy', () => {
  const source = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-auth/src/assetsAuthConfig.ts');
  assert.match(source, /resolveAssetsAuthAppearance/);
  assert.match(source, /resolveAssetsAuthRuntimeConfig/);
  assert.match(source, /resolveAssetsAuthLocale/);
});

test('vite config blocks dev auth credentials in production builds', () => {
  const source = readUtf8('apps/sdkwork-assets-pc/vite.config.ts');
  assert.match(source, /VITE_SDKWORK_ASSETS_AUTH_DEV_EMAIL/);
  assert.match(source, /mode === 'production'/);
});

test('typescript resolves ui through package dist not source alias', () => {
  const source = readUtf8('apps/sdkwork-assets-pc/tsconfig.base.json');
  assert.doesNotMatch(source, /@sdkwork\/ui-pc-react.*\/src\//);
});

test('shell uses AssetsAuthGate with SdkworkIamAuthRoutes', () => {
  const shell = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-shell/src/AssetsAppShell.tsx');
  const authHost = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-shell/src/AssetsAuthRoutesHost.tsx');
  assert.match(shell, /AssetsAuthGate/);
  assert.match(shell, /AssetsAuthRoutesHost/);
  assert.match(authHost, /SdkworkIamAuthRoutes/);
  assert.match(authHost, /lazy\s*\(/);
});

test('shell lazy-loads product ui modules', () => {
  const source = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-shell/src/AssetsAppShell.tsx');
  assert.match(source, /lazy\s*\(/);
  assert.match(source, /@sdkwork\/assets-pc-assets/);
});

test('application roots live under apps/ per workspace spec', () => {
  readUtf8('apps/README.md');
  readUtf8('apps/sdkwork-assets-pc/sdkwork.app.config.json');
  assert.equal(
    fs.existsSync(path.join(repoRoot, 'apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-core')),
    true,
  );
});

test('assets package exports gallery and catalog modules only', () => {
  const index = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/index.ts');
  const packageJson = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/package.json');
  readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/gallery.ts');
  const gallery = readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/gallery/AssetGalleryView.tsx');
  assert.match(index, /AssetCenterPage/);
  assert.match(index, /AssetCatalogService/);
  assert.match(gallery, /useTranslation/);
  readUtf8('apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-assets/src/gallery/mapGenerationHistoryToGallery.ts');
  assert.doesNotMatch(index, /AssetWorkspacePanel/);
  assert.doesNotMatch(index, /AssetWorkspaceKindTabs/);
  assert.doesNotMatch(packageJson, /generation-workspace/);
  assert.doesNotMatch(packageJson, /generation-playground/);
  assert.doesNotMatch(packageJson, /generation-panel/);
});
