# SDKWork Assets — Technical Architecture

## System context

```text
Modality backends (image/video/music/audio)
  -> clawrouter_open_sdk::SdkworkAiClient
  -> sdkwork-assets-ingestion (MediaArtifactBatch + DriveImportPlan)
  -> sdkwork-drive (ai_generated import + /assets catalog)

Browser (`apps/sdkwork-assets-pc`)
  -> @sdkwork/assets-core (contracts)
  -> Drive App SDK (assets.list, assets.get, uploader.*)
  -> Platform API Gateway
  -> sdkwork-drive (global assets authority)
```

See [TECH-UNIFIED-ASSETS-PLATFORM.md](./TECH-UNIFIED-ASSETS-PLATFORM.md) for the full platform model.

## Ownership boundaries

| Layer | Owner | This repository |
| --- | --- | --- |
| Global assets API | `sdkwork-drive` | Consumer only |
| Upload lifecycle | `sdkwork-drive` | Consumer only |
| Unified asset contracts + ingestion | `sdkwork-assets` | Owner (`packages/`, `crates/`) |
| Asset UI | `sdkwork-assets` | Owner |
| Authentication | `sdkwork-iam` | Consumer |

## Package architecture

```text
apps/sdkwork-assets-common/packages/sdkwork-assets-core/  Canonical TS contracts + ingestion + catalog mapping
crates/sdkwork-assets-contract/          Rust MediaResource + MediaArtifactBatch
crates/sdkwork-assets-ingestion/         Drive import planning
crates/sdkwork-assets-ingestion-drive/  Drive uploader execution adapter

apps/sdkwork-assets-pc/
  packages/sdkwork-assets-pc-core       SDK client boundary (Drive)
  packages/sdkwork-assets-pc-commons    Re-exports @sdkwork/assets-core + @sdkwork/utils
  packages/sdkwork-assets-pc-assets     Asset center, choose-asset, gallery, services
  packages/sdkwork-assets-pc-shell      Routing and layout
  packages/sdkwork-assets-pc-auth       IAM gate (`AssetsAuthGate`) + auth policy config
  packages/sdkwork-assets-pc-i18n       Locale catalogs
```

Dependency direction: UI → service → SDK. No raw HTTP outside generated SDK clients.

Asset list and picker UIs share `useAssetsListInfiniteQuery` (cursor pagination, deferred search, server-side `kind` / `sourceType` filters). Archive and restore patch the React Query cache because Drive `assets.list` currently omits the archived property flag in list rows.

## Framework posture

| Framework | Status | Rationale |
| --- | --- | --- |
| `sdkwork-web-framework` | Not required | No owned platform HTTP APIs |
| `sdkwork-database` | Not required | No owned relational persistence |
| `sdkwork-discovery` | Not required | No RPC services |
| `sdkwork-utils` | Required | Standard TypeScript helpers |
| `sdkwork-drive` | Required | Asset and upload authority |

## Authentication flow

1. `SdkworkSessionAuthBrowserRoot` wraps the app (`main.tsx`).
2. `AssetsAuthGate` bootstraps IAM session via `createSdkworkAppbasePcAuthRuntime` (`sdkwork-assets-pc-core`).
3. Unauthenticated production users redirect to `/auth/login`; auth routes render `SdkworkIamAuthRoutes` with app i18n locale mapping.
4. Drive SDK client shares the IAM `TokenManager` (dual-token); session changes invalidate the cached Drive client.
5. Production builds reject `VITE_SDKWORK_ASSETS_AUTH_DEV_*` at Vite config time.

## Security

- Session tokens via IAM/appbase TokenManager; no `Access-Token` in env files.
- All API calls through generated SDK with standard auth headers.
- Upload validation delegated to Drive uploader (MIME, checksum, tenant scope).
- Vite dev/preview servers apply CSP and baseline security headers.
- Production builds reject dev auth prefill env vars at build time.

## Local development

- Vite dev server (port `4180`) proxies `/app/v3/api` to the platform gateway or standalone app ingress per `VITE_SDKWORK_ASSETS_DEPLOYMENT_PROFILE`.
- Topology env files under `configs/topology/` supply profile-specific gateway URLs.

## Deployment

- `deploymentProfile`: `standalone` or `cloud`
- Topology contract: `specs/topology.spec.json`
- Release workflow: `sdkwork.workflow.json` + `.github/workflows/package.yml`
- Browser static assets served behind platform API gateway
