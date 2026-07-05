# SDKWork Assets — Unified Asset Management Platform
repository-kind: application


SDKWork Assets is the **unified asset management platform** for AI-generated and user-owned media. It provides shared contracts and ingestion orchestration over `sdkwork-drive`, plus browser client surfaces for catalog browsing and selection.

## Platform boundaries

| Layer | Owner | This repository |
| --- | --- | --- |
| Object storage, upload sessions, presign | `sdkwork-drive` | Consumer / orchestrator |
| Global assets HTTP API (`/app/v3/api/assets*`) | `sdkwork-drive` | Consumer |
| **Unified asset contracts + multi-artifact ingestion** | **`sdkwork-assets`** | **Owner (shared libraries)** |
| AI provider routing (`/v1/*`) | `sdkwork-clawrouter` (`clawrouter-open-sdk`) | Integration profile only |
| Modality generation jobs (image/video/music/audio) | respective domain repos | Consumers of assets-ingestion |
| Generation records / playground facade | `sdkwork-generations` | Consumer |

Modality backend services **MUST** invoke provider capabilities through **`clawrouter_open_sdk::SdkworkAiClient`** (Rust) or `@sdkwork/clawrouter-open-sdk` (TypeScript). Raw provider HTTP is forbidden.

## Active layout

| Directory | Purpose |
| --- | --- |
| [`packages/sdkwork-assets-core/`](./packages/sdkwork-assets-core/) | TypeScript contracts + ingestion planning (`MediaResource`, `MediaArtifactBatch`) |
| [`crates/sdkwork-assets-contract/`](./crates/sdkwork-assets-contract/) | Rust canonical contracts (`MEDIA_RESOURCE_SPEC`) |
| [`crates/sdkwork-assets-ingestion/`](./crates/sdkwork-assets-ingestion/) | Rust multi-artifact Drive import planning + ClawRouter integration boundary |
| [`crates/sdkwork-assets-ingestion-drive/`](./crates/sdkwork-assets-ingestion-drive/) | Rust Drive uploader execution adapter |
| [`apps/sdkwork-assets-pc/`](./apps/sdkwork-assets-pc/) | PC browser client (asset center, choose-asset) |
| [`specs/`](./specs/) | Topology, component spec, governance |
| [`docs/`](./docs/) | PRD, technical architecture |

**Intentionally absent at root:** `apis/` (no owned HTTP surfaces), `database/` (metadata owned by Drive), `sdks/` (consumes `@sdkwork/drive-app-sdk`).

## Documentation

- [Unified platform architecture](./docs/architecture/tech/TECH-UNIFIED-ASSETS-PLATFORM.md)
- [Technical architecture](./docs/architecture/tech/TECH_ARCHITECTURE.md)
- [PRD](./docs/product/prd/PRD.md)

## Development

```bash
pnpm install
pnpm verify          # topology + architecture + TS/Rust contract tests
cargo test --workspace
pnpm --filter @sdkwork/assets-core test
pnpm dev             # PC client on :4180
```
