# Repository Guidelines

## SDKWORK Soul

Read `../../../sdkwork-specs/SOUL.md` before executing tasks in this root.

## SDKWORK Standards

Canonical SDKWORK specs path from this application root:

- `../../../sdkwork-specs/README.md`
- `../../../sdkwork-specs/SOUL.md`
- `../../../sdkwork-specs/AGENTS_SPEC.md`
- `../../../sdkwork-specs/SDKWORK_WORKSPACE_SPEC.md`
- `../../../sdkwork-specs/COMPONENT_SPEC.md`

## Application Identity

This root is `sdkwork-assets-common`: a shared, non-runnable package root for SDKWork Assets. It does not own `sdkwork.app.config.json`; runnable app identity lives in `../sdkwork-assets-pc/sdkwork.app.config.json`.

## Local Dictionary Structure

- `README.md`: common root index.
- `AGENTS.md`: local agent entrypoint.
- `.sdkwork/`: source-controlled workspace metadata for local skills/plugins.
- `specs/component.spec.json`: common root component contract.
- `packages/sdkwork-assets-core/`: shared TypeScript contracts and ingestion helpers.

## Execution Rules

- Keep shared packages cross-architecture and UI-free.
- Do not move PC-only React code into this root.
- Do not copy global `sdkwork-specs` bodies locally; link them through component specs.
- Run package-level verification before reporting shared package changes complete.
