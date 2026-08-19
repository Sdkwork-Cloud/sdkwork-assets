# SDKWork Assets — Product Requirements

## Summary

SDKWork Assets is the platform client for browsing, filtering, selecting, and uploading global content assets. It exposes asset-center and choose-asset experiences for SDKWork applications and operators.

## Goals

1. Provide a unified asset library UI across tenant-scoped global assets.
2. Integrate file uploads exclusively through Drive Uploader (`@sdkwork/drive-app-sdk`).
3. Consume the global assets catalog through `@sdkwork/assets-app-sdk` without duplicating backend contracts.
4. Ship as a standalone browser application and embeddable `@sdkwork/assets-pc-*` packages.

## Non-goals

- Owning relational database tables or object storage lifecycle (owned by `sdkwork-drive`).
- Platform RPC services or service discovery integration in the initial release.

## Core user stories

| ID | Story | Acceptance |
| --- | --- | --- |
| US-01 | As a user, I browse my tenant asset library | Lists assets with cursor pagination, kind/source filters, and search |
| US-02 | As a user, I upload a file to the library | Upload completes via Drive Uploader; asset appears in list |
| US-03 | As a user, I select an asset from a picker | Choose-asset modal returns selected `assetId` / `driveNodeId` |
| US-04 | As a user, I archive and restore assets | Archive/restore calls `@sdkwork/assets-app-sdk` |
| US-05 | As a user, I sign in before using the asset center | Production builds enforce IAM login via `AssetsAuthGate` |

## Dependencies

- `sdkwork-iam` — authentication and session
- `sdkwork-assets` — global assets catalog API (`/app/v3/api/assets*`) and `@sdkwork/assets-app-sdk`
- `sdkwork-drive` — uploader and storage lifecycle
- `sdkwork-appbase` — auth UI and runtime bootstrap
- `sdkwork-utils` — shared TypeScript utilities
