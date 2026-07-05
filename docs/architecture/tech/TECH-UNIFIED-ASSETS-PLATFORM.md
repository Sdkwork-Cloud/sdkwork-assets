# SDKWork Assets — Unified Asset Management Platform

> Authority: `MEDIA_RESOURCE_SPEC.md`, `DRIVE_SPEC.md`, `API_SPEC.md`.

## 1. Role

SDKWork Assets is the **unified asset management platform** for AI-generated and user-owned media:

- **One canonical media model** (`MediaResource`, `MediaArtifactBatch`)
- **One multi-artifact ingestion pipeline** (1 generation → N files)
- **One Drive-backed persistence model** (`ai_generated` space → global `/assets` catalog)
- **One ClawRouter integration boundary** for modality backends

Assets **does not** own object storage, relational metadata, or the global assets HTTP API. Those remain in `sdkwork-drive`.

## 2. Layered architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ Clients: sdkwork-assets-pc, Playground, modality PC apps        │
└────────────────────────────┬────────────────────────────────────┘
                             │ @sdkwork/assets-core, @sdkwork/drive-app-sdk
┌────────────────────────────▼────────────────────────────────────┐
│ sdkwork-assets (THIS REPO)                                       │
│  packages/sdkwork-assets-core          TS contracts + planning   │
│  crates/sdkwork-assets-contract        Rust canonical types      │
│  crates/sdkwork-assets-ingestion       Drive import plan         │
│  crates/sdkwork-assets-ingestion-drive Drive uploader execution  │
│  crates/sdkwork-assets-bridge-image    Image modality bridge     │
│  apps/sdkwork-assets-pc                  PC browser client         │
└────────────────────────────┬────────────────────────────────────┘
                             │ Drive uploader + /app/v3/api/assets*
┌────────────────────────────▼────────────────────────────────────┐
│ sdkwork-drive                                                    │
│  ai_generated spaces, nodes, global assets catalog               │
└─────────────────────────────────────────────────────────────────┘

Modality backends (image, video, music, audio):
  clawrouter_open_sdk::SdkworkAiClient → normalize → assets-ingestion
```

## 3. Asset taxonomy (orthogonal dimensions)

| Dimension | Authority | Purpose |
| --- | --- | --- |
| `MediaKind` | `MEDIA_RESOURCE_SPEC` / `@sdkwork/assets-core` | Content type: image, video, audio, voice, document, archive, model, other |
| `MediaSource` | same | Reference mode: drive, external_url, provider_asset, generated, data_url |
| `AssetItem.assetKind` | `sdkwork-drive` `/assets` API | Catalog filter: file, image, video, audio, document, model, other |
| `AssetItem.sourceType` | `sdkwork-drive` | Business origin: upload, ai_generated, imported, edited, system |
| `MediaArtifactBatch` | `sdkwork-assets-ingestion` | Pre-import multi-output orchestration |
| `AssetGalleryType` | PC UI view-model | Display grouping: image, video, speech, sound, music |

Mapping helpers live in `@sdkwork/assets-core/asset-mapping` (`mediaKindToAssetKind`, `assetItemToMediaResource`, `galleryTypeFromMediaKind`).

## 4. Core domain model

### 4.1 MediaArtifactBatch

Every generation command produces a **batch**, not a single file:

| Modality | Provider reality | Batch mapping |
| --- | --- | --- |
| Image | N images per job | `artifacts[0..N-1]` |
| Video | N renders / variants | same |
| Music | up to 16 Suno variants | same |
| Audio | speech + waveform + metadata | same |
| Model | weights + config + tokenizer | `kind: model` entries |

### 4.2 Lifecycle

```text
ProviderAsset (transient URL)
  → MediaArtifact (normalized, indexed)
  → DriveImportPlan (per artifact)
  → ImportedMediaArtifact (drive node + MediaResource snapshot)
  → AssetCatalogRef (Drive /assets entry; assetId = driveNodeId)
```

### 4.3 MediaResource

Full schema per `MEDIA_RESOURCE_SPEC §3`, implemented in:

- TypeScript: `packages/sdkwork-assets-core/src/mediaResource.ts`
- Rust: `crates/sdkwork-assets-contract/src/media_resource.rs`

Required fields: `kind`, `source`. Drive-backed persisted resources use `source = drive`, `uri = drive://spaces/{spaceId}/nodes/{nodeId}`, `id = {nodeId}`.

AI-generated imports attach `ai.provenance = generated` and `ai.generationTaskId` during ingestion planning.

## 5. API ownership

| Capability | Owning repo | Path prefix |
| --- | --- | --- |
| Global asset catalog | sdkwork-drive | `/app/v3/api/assets*` |
| Image generation | sdkwork-image | `/app/v3/api/image/generations*` |
| Video generation | sdkwork-video | `/app/v3/api/video/generations*` |
| Music generation | sdkwork-music | `/app/v3/api/music/generations*` |
| Audio generation | sdkwork-audio | `/app/v3/api/audio/generations/*` |
| Playground facade | sdkwork-generations | `/app/v3/api/generations/*` |
| Provider relay | sdkwork-clawrouter | `/v1/*` open-sdk |

## 6. Package map

| Package | Language | Role |
| --- | --- | --- |
| `sdkwork-assets-contract` | Rust | Canonical types |
| `sdkwork-assets-ingestion` | Rust | Batch planning, ClawRouter boundary |
| `sdkwork-assets-ingestion-drive` | Rust | Drive uploader command builder |
| `sdkwork-assets-bridge-image` | Rust | Image modality bridge |
| `@sdkwork/assets-core` | TypeScript | Contracts, ingestion planning, catalog mapping |
| `@sdkwork/assets-pc-*` | TypeScript | PC client UI |

## 7. ClawRouter integration

Modality Rust services integrate **`clawrouter-open-sdk`** only. After provider normalization:

```rust
let plan = IngestionPlanBuilder::plan_drive_import(&batch, &context)?;
// execute via sdkwork-assets-ingestion-drive
```

Raw provider HTTP from modality services is forbidden.

## 8. Cross-repository consumers

| Consumer | Integration |
| --- | --- |
| `@sdkwork/image-contracts` | Re-exports `@sdkwork/assets-core` (`SdkworkMediaResource` alias) |
| `@sdkwork/generations-pc-workspace` | Uses `@sdkwork/assets-pc-commons` + `readMediaResourceUrl` |
| `sdkwork-image-generation-runtime-service` | Executes imports via `sdkwork-assets-bridge-image` + `sdkwork-assets-ingestion-drive` |
| `@sdkwork/drive-app-sdk` | Owns `AssetItem`; OpenAPI `MediaResource` aligned to spec |

Verification: `node --test tests/cross-repo-media-alignment.test.mjs` from `sdkwork-assets` root.

## 9. Verification

```bash
# From sdkwork-assets root
cargo test --workspace
pnpm --filter @sdkwork/assets-core test
pnpm verify
```

Authority: `MEDIA_RESOURCE_SPEC.md`, `DRIVE_SPEC.md`, `API_SPEC.md`, `NAMING_SPEC.md`.
