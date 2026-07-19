//! Ingestion orchestration for provider outcomes → Drive `ai_generated` → optional global assets catalog.
//!
//! Modality backend services invoke their registered provider adapter, normalize outputs into
//! [`MediaArtifactBatch`], then call this crate to plan and execute Drive import.

mod drive_layout;
mod plan;
mod promote;
mod provider;

pub use drive_layout::{
    build_ai_generated_node_id, build_ai_generated_space_id, build_drive_uri, build_upload_task_id,
    stable_identifier_suffix, upload_profile_for_media_kind,
};
pub use plan::{
    media_kind_from_str, DriveImportExecutionResult, DriveImportItemPlan, DriveImportPlan,
    DriveIngestContext, DriveSpaceProfile, IngestionError, IngestionPlanBuilder,
};
pub use promote::{
    build_ai_generated_catalog_ref, AssetPromoteOptions, AssetPromoteRequest, AssetPromoteResult,
};
pub use provider::{NormalizedProviderBatchInput, ProviderAdapterProfile, ProviderGenerationPhase};

use sdkwork_assets_contract::MediaArtifactBatch;

/// Executes Drive import and optional catalog promotion.
pub trait AssetsIngestionExecutor: Send + Sync {
    fn plan_drive_import(
        &self,
        batch: &MediaArtifactBatch,
        context: &DriveIngestContext,
    ) -> Result<DriveImportPlan, IngestionError>;

    fn execute_drive_import(
        &self,
        plan: &DriveImportPlan,
    ) -> Result<DriveImportExecutionResult, IngestionError>;

    fn promote_to_global_assets(
        &self,
        request: &AssetPromoteRequest,
    ) -> Result<AssetPromoteResult, IngestionError>;
}
