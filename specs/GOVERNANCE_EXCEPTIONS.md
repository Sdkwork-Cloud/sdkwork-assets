# SDKWork Assets — Repository Governance Exceptions

Per [`GOVERNANCE_SPEC.md`](../../sdkwork-specs/GOVERNANCE_SPEC.md).

## EX-2026-ASSETS-001: No owned relational database

```yaml
id: EX-2026-ASSETS-001
spec: DATABASE_FRAMEWORK_SPEC.md
rule: Application databases MUST use sdkwork-database lifecycle
owner: sdkwork-assets-team
reason: >
  Asset metadata and storage lifecycle remain owned by sdkwork-drive.
  sdkwork-assets serves global assets HTTP APIs by composing sdkwork-drive
  database bootstrap, ACL, and node repositories through sdkwork-routes-drive-app-api.
expires_at: 2027-12-31
removal_plan: >
  Add database/ only if product-owned metadata beyond Drive storage is approved.
```

## EX-2026-ASSETS-002: No owned object storage lifecycle

```yaml
id: EX-2026-ASSETS-002
spec: STORAGE_SPEC.md
rule: Object storage lifecycle MUST remain in the storage owner application
owner: sdkwork-assets-team
reason: >
  Binary storage, upload sessions, and download URLs remain owned by sdkwork-drive.
  sdkwork-assets exposes global asset metadata and collection/relation APIs only.
expires_at: 2027-12-31
removal_plan: >
  Revisit only if sdkwork-assets gains an approved storage authority via ADR.
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
