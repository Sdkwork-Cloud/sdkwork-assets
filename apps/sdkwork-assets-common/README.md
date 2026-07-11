# SDKWork Assets Common

Shared, non-runnable package root for SDKWork Assets.

## Purpose

This root owns cross-architecture TypeScript contracts and service helpers consumed by SDKWork Assets PC, future H5/mobile clients, and sibling SDKWork repositories.

## Packages

| Package | Purpose |
| --- | --- |
| [`packages/sdkwork-assets-core/`](./packages/sdkwork-assets-core/) | Canonical asset contracts, media-resource mapping, and ingestion planning helpers. |

## Boundaries

- This root is not a runnable client surface.
- Cross-client contracts live under `packages/`.
- PC-only UI packages stay under `../sdkwork-assets-pc/packages/`.
- Global standards are linked through local component specs; do not copy global `*_SPEC.md` files here.

## Verification

```bash
pnpm --filter @sdkwork/assets-core test
pnpm --filter @sdkwork/assets-core typecheck
```
