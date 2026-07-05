# SDKWork Assets — Structure & Standards Alignment

Last reviewed: 2026-07-05

## Summary

`sdkwork-assets` is a **unified asset platform repository** with shared Rust/TypeScript contracts, ingestion orchestration, and a PC browser client. It consumes `sdkwork-drive` for storage and the global assets catalog. Platform HTTP APIs, relational persistence, and object lifecycle remain owned by Drive per governance exceptions.

## Standards alignment

| Requirement | Status | Evidence |
| --- | --- | --- |
| `sdkwork-specs` / `MEDIA_RESOURCE_SPEC` | Aligned | `@sdkwork/assets-core`, `sdkwork-assets-contract` |
| `sdkwork-drive` consumer integration | Aligned | `@sdkwork/drive-app-sdk`, `sdkwork-assets-ingestion-drive` |
| `sdkwork-utils` | Aligned | assets-core, commons, auth, list filters |
| `sdkwork-web-framework` | N/A | No owned HTTP APIs — `EX-2026-ASSETS-001` |
| `sdkwork-database` | N/A | No owned relational persistence — `EX-2026-ASSETS-002` |
| Repository layout | Aligned | `packages/`, `crates/`, `apps/sdkwork-assets-pc/` |
| Verification | Aligned | `pnpm verify`, architecture + contract tests |

## Canonical layout

```text
sdkwork-assets/
  packages/sdkwork-assets-core/     # TS contracts + ingestion + catalog mapping
  crates/sdkwork-assets-contract/   # Rust canonical types
  crates/sdkwork-assets-ingestion/  # Multi-artifact import planning
  crates/sdkwork-assets-ingestion-drive/
  crates/sdkwork-assets-bridge-image/
  apps/sdkwork-assets-pc/           # PC browser client
  specs/                            # topology, component, governance
  docs/                             # PRD + architecture
  tests/                            # Cross-repo verification
  # Intentionally absent: apis/, database/, sdks/ (consumes drive-app-sdk)
```

## Framework integration

### Drive

- Global assets API: `sdkwork-drive` (`/app/v3/api/assets*`)
- Upload: `client.uploader.uploadAttachment()` or `sdkwork-assets-ingestion-drive`
- Catalog types: consume `AssetItem` from `@sdkwork/drive-app-sdk`; map via `@sdkwork/assets-core/asset-mapping`
- No parallel asset tables or raw HTTP

### Utils

- `isBlank`, `trim`, `formatDatetimeLocaleStr`, `SdkWorkProblemDetail` across commons/auth/assets packages
- No duplicated local string/date helpers in assets-core

## Verification

```bash
pnpm verify
cargo test --workspace
node ../sdkwork-specs/tools/audit-repository-baseline.mjs --root .
```
