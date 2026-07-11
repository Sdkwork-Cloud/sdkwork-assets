# SDKWork Assets — Architecture Alignment

Last reviewed: 2026-07-05

## Summary

| Area | Status | Evidence |
| --- | --- | --- |
| Agent entrypoints | Aligned | Root `AGENTS.md`, shim files, `.sdkwork/` |
| Repository baseline (L1) | Aligned | `audit-repository-baseline.mjs` pass |
| Runtime topology | Aligned | `specs/topology.spec.json` validates |
| PC package architecture | Aligned | `apps/sdkwork-assets-pc/packages/sdkwork-assets-pc-{core,commons,assets,shell,auth,i18n}` |
| Application root layout | Aligned | `apps/sdkwork-assets-pc/` per `SDKWORK_WORKSPACE_SPEC.md` / `APP_PC_ARCHITECTURE_SPEC.md` |
| IAM login integration | Aligned | `@sdkwork/auth-runtime-pc-react`, `@sdkwork/auth-pc-react`, `AssetsAuthGate` |
| Drive global assets API | Aligned | `@sdkwork/drive-app-sdk` via TokenManager-bound client |
| Drive list pagination | Aligned | Shared `useAssetsListInfiniteQuery` + `AssetPage.nextCursor` |
| Drive list filters | Aligned | Server-side `kind` / `sourceType` via `buildListAssetsQuery` |
| MediaResource / catalog mapping SSOT | Aligned | `apps/sdkwork-assets-common/packages/sdkwork-assets-core` (`MEDIA_RESOURCE_SPEC` + `asset-mapping`) |
| Cross-repo MediaResource consumers | Aligned | `@sdkwork/image-contracts`, `@sdkwork/generations-pc-workspace` re-export/consume assets-core |
| Drive OpenAPI MediaResource | Aligned | `drive-app-api.openapi.json` kind/source/durationSeconds per spec |
| Archive/restore UI consistency | Aligned | `patchAssetLifecycleInCache` compensates Drive list lifecycle gap |
| Drive uploader | Aligned | `client.uploader.uploadAttachment()` only |
| `sdkwork-utils` | Aligned | commons, auth gate, session store, `readAssetsViteEnv` |
| Production build security | Aligned | Vite + runtime guard for `VITE_SDKWORK_ASSETS_AUTH_DEV_*` |
| Dev server security | Aligned | `browserSecurityHeadersPlugin` (CSP + baseline headers) |
| Dev API proxy | Aligned | Vite proxy for `/app/v3/api` (standalone + cloud profiles) |
| `sdkwork-web-framework` | N/A | No owned platform HTTP APIs — `EX-2026-ASSETS-001` |
| `sdkwork-database` | N/A | No owned relational persistence — `EX-2026-ASSETS-002` |
| `sdkwork-discovery` | N/A | No RPC services — `EX-2026-ASSETS-003` |
| Release / CI | Aligned | `sdkwork.workflow.json`, `.github/workflows/package.yml` |
| Verification | Aligned | `pnpm verify`, architecture + structure tests |

## Framework integration

### IAM (`IAM_LOGIN_INTEGRATION_SPEC.md`)

- `createSdkworkAppbasePcAuthRuntime` in `sdkwork-assets-pc-core`
- `SdkworkSessionAuthBrowserRoot` + `SdkworkIamAuthRoutes` in app shell
- `AssetsAuthGate` enforces session in production via `VITE_SDKWORK_ASSETS_IAM_REQUIRED` default
- Drive SDK client shares IAM `TokenManager` (dual-token auth)

### Drive (`DRIVE_SPEC.md` / `sdkwork-drive`)

- Global assets API authority: `sdkwork-drive` (`/app/v3/api/assets*`)
- Consumer SDK: `@sdkwork/drive-app-sdk` bound to IAM `TokenManager`
- Upload: `client.uploader.uploadAttachment` with `appResourceType` + `appResourceId`
- List pagination: Drive `assets.list` cursor mode via `useAssetsListInfiniteQuery` (`AssetPage.nextCursor`)
- List filters: server-side `kind` and `sourceType` query params via `buildListAssetsQuery` + `@sdkwork/utils` `isBlank`
- Archive/restore: command responses update local cache because list items omit archived flag today
- No parallel asset tables, no raw HTTP, no custom presign endpoints

### Utils (`sdkwork-utils`)

- `isBlank`, `trim`, `formatDatetimeLocaleStr`, `SdkWorkProblemDetail` mapping
- Centralized `readAssetsViteEnv()` in `@sdkwork/assets-pc-commons` (no duplicated env readers)
- No duplicated local pagination/date/error helpers

### Security

- Production builds fail when `VITE_SDKWORK_ASSETS_AUTH_DEV_*` is present (`vite.config.ts` + runtime guard)
- IAM session enforced in production via `VITE_SDKWORK_ASSETS_IAM_REQUIRED` default
- Redirect targets sanitized in `sanitizeAssetsAuthRedirect()`
- Dev/preview servers apply CSP and baseline browser security headers (`config/browser/securityHeaders.ts`)

## Verification

```bash
pnpm verify
pnpm build
node ../sdkwork-specs/tools/audit-repository-baseline.mjs --root .
```
