# SDKWork Assets — Repository Governance Exceptions

Per [`GOVERNANCE_SPEC.md`](../../sdkwork-specs/GOVERNANCE_SPEC.md).

## EX-2026-ASSETS-001: Consumer client without platform HTTP APIs

```yaml
id: EX-2026-ASSETS-001
spec: WEB_FRAMEWORK_SPEC.md
rule: Rust HTTP surfaces MUST integrate sdkwork-web-framework
owner: sdkwork-assets-team
reason: >
  sdkwork-assets is a browser client that consumes sdkwork-drive global assets APIs.
  It does not own open-api, app-api, or backend-api surfaces.
expires_at: 2027-12-31
removal_plan: >
  If assets-specific HTTP APIs are approved beyond Drive global-assets facade,
  add apis/, route crates, and sdkwork-web-framework integration per ADR.
```

## EX-2026-ASSETS-002: No owned relational database

```yaml
id: EX-2026-ASSETS-002
spec: DATABASE_FRAMEWORK_SPEC.md
rule: Application databases MUST use sdkwork-database lifecycle
owner: sdkwork-assets-team
reason: >
  Asset metadata and storage lifecycle are owned by sdkwork-drive.
  This client persists only session state via browser storage.
expires_at: 2027-12-31
removal_plan: >
  Add database/ only if product-owned metadata beyond Drive facade is approved.
```

## EX-2026-ASSETS-003: No RPC / discovery

```yaml
id: EX-2026-ASSETS-003
spec: DISCOVERY_SPEC.md
rule: RPC services MUST register with sdkwork-discovery
owner: sdkwork-assets-team
reason: >
  sdkwork-assets has no gRPC/RPC services in the initial release.
expires_at: 2027-12-31
removal_plan: >
  Integrate sdkwork-discovery when RPC services are introduced.
```

## EX-2026-ASSETS-004: Platform libraries without owned HTTP catalog API

```yaml
id: EX-2026-ASSETS-004
spec: SDKWORK_WORKSPACE_SPEC.md
rule: Standard root apis/, crates/, database/, sdks/ dictionary when owning platform capabilities
owner: sdkwork-assets-team
reason: >
  sdkwork-assets owns unified asset management **shared libraries** (contracts + ingestion)
  and consumer PC/H5/Flutter surfaces. Global assets HTTP API and storage lifecycle remain
  owned by sdkwork-drive. No app-api/backend-api route crates at this repository root.
expires_at: 2027-12-31
removal_plan: >
  Add apis/ and sdkwork-web-framework route crates only if product-owned HTTP surfaces
  beyond Drive global-assets are approved via ADR.
```
