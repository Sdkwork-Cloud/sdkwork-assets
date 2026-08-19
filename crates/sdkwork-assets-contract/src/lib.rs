//! Canonical contracts for SDKWork unified asset management.
//!
//! Authority: `MEDIA_RESOURCE_SPEC.md`, `DRIVE_SPEC.md`.
//! Storage lifecycle remains owned by `sdkwork-drive`; global asset catalog HTTP
//! authority lives in `sdkwork-assets` (`/app/v3/api/assets*`).

mod artifact;
mod media_kind;
mod media_resource;
mod provenance;

pub use artifact::{
    AssetCatalogRef, AssetLifecycleState, AssetSourceType, ImportedMediaArtifact, MediaArtifact,
    MediaArtifactBatch,
};
pub use media_kind::{MediaKind, MediaSource};
pub use media_resource::{
    media_kind_to_asset_kind, MediaAccess, MediaAccessVisibility, MediaAiProvenance,
    MediaAiProvenanceKind, MediaChecksum, MediaModerationStatus, MediaResource, MediaResourceError,
};
pub use provenance::{GenerationProvenance, ProviderRef};
