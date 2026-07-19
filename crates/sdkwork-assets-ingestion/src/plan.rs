use sdkwork_assets_contract::{
    ImportedMediaArtifact, MediaAiProvenance, MediaAiProvenanceKind, MediaArtifact,
    MediaArtifactBatch, MediaKind, MediaResource, MediaSource,
};
use thiserror::Error;

use crate::drive_layout::{
    build_ai_generated_node_id, build_ai_generated_space_id, build_drive_uri, build_upload_task_id,
    upload_profile_for_media_kind,
};

#[derive(Debug, Error, PartialEq, Eq)]
pub enum IngestionError {
    #[error("invalid batch: {0}")]
    InvalidBatch(&'static str),
    #[error("tenant scope is required")]
    MissingTenant,
    #[error("owner subject is required")]
    MissingOwner,
    #[error("generation id is required")]
    MissingGenerationId,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum DriveSpaceProfile {
    AiGenerated,
}

impl DriveSpaceProfile {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::AiGenerated => "ai_generated",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DriveIngestContext {
    pub tenant_id: String,
    pub owner_subject_type: String,
    pub owner_subject_id: String,
    pub actor_type: String,
    pub actor_id: String,
    pub space_profile: DriveSpaceProfile,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DriveImportItemPlan {
    pub output_index: i32,
    pub scene: String,
    pub drive_space_id: String,
    pub drive_node_id: String,
    pub drive_uri: String,
    pub upload_profile_code: String,
    pub upload_task_id: String,
    pub provider_asset_id: Option<String>,
    pub provider_uri: Option<String>,
    pub provider_url: Option<String>,
    pub media_resource: MediaResource,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DriveImportPlan {
    pub generation_id: String,
    pub provider_code: String,
    pub items: Vec<DriveImportItemPlan>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DriveImportExecutionResult {
    pub imported: Vec<ImportedMediaArtifact>,
}

pub struct IngestionPlanBuilder;

impl IngestionPlanBuilder {
    pub fn plan_drive_import(
        batch: &MediaArtifactBatch,
        context: &DriveIngestContext,
    ) -> Result<DriveImportPlan, IngestionError> {
        batch.validate().map_err(IngestionError::InvalidBatch)?;
        if context.tenant_id.trim().is_empty() {
            return Err(IngestionError::MissingTenant);
        }
        if context.owner_subject_id.trim().is_empty() {
            return Err(IngestionError::MissingOwner);
        }
        let generation_id = batch.provenance.generation_id.trim();
        if generation_id.is_empty() {
            return Err(IngestionError::MissingGenerationId);
        }

        let provider_code = batch
            .provenance
            .provider
            .as_ref()
            .map(|provider| provider.provider_code.clone())
            .unwrap_or_else(|| "unknown".to_string());

        let drive_space_id =
            build_ai_generated_space_id(&context.owner_subject_type, &context.owner_subject_id);
        let modality = batch.provenance.modality.trim();
        let items = batch
            .artifacts
            .iter()
            .map(|artifact| {
                build_item_plan(
                    artifact,
                    generation_id,
                    modality,
                    &batch.provenance.scene,
                    &provider_code,
                    &drive_space_id,
                    context,
                )
            })
            .collect::<Result<Vec<_>, IngestionError>>()?;

        Ok(DriveImportPlan {
            generation_id: generation_id.to_string(),
            provider_code,
            items,
        })
    }
}

fn build_item_plan(
    artifact: &MediaArtifact,
    generation_id: &str,
    modality: &str,
    scene: &str,
    _provider_code: &str,
    drive_space_id: &str,
    _context: &DriveIngestContext,
) -> Result<DriveImportItemPlan, IngestionError> {
    let drive_node_id = build_ai_generated_node_id(generation_id, artifact.index);
    let drive_uri = build_drive_uri(drive_space_id, &drive_node_id);
    let upload_task_id = build_upload_task_id(modality, generation_id, artifact.index);

    let media_resource = MediaResource {
        id: Some(drive_node_id.clone()),
        kind: artifact.kind,
        source: MediaSource::Drive,
        url: None,
        public_url: None,
        uri: Some(drive_uri.clone()),
        object_blob_id: None,
        file_name: artifact.file_name.clone(),
        mime_type: artifact.mime_type.clone(),
        size_bytes: artifact.size_bytes.map(|value| value.to_string()),
        checksum: None,
        width: artifact.width,
        height: artifact.height,
        duration_seconds: artifact.duration_seconds,
        alt_text: None,
        title: None,
        poster: None,
        thumbnails: None,
        variants: None,
        access: None,
        ai: Some(MediaAiProvenance {
            provenance: Some(MediaAiProvenanceKind::Generated),
            provider: None,
            model: None,
            prompt_id: None,
            generation_task_id: Some(generation_id.to_string()),
            source_media_ids: None,
            seed: None,
            moderation_status: None,
            safety_labels: None,
        }),
        metadata: None,
    };
    media_resource
        .validate()
        .map_err(|_| IngestionError::InvalidBatch("invalid media resource"))?;

    Ok(DriveImportItemPlan {
        output_index: artifact.index,
        scene: scene.to_string(),
        drive_space_id: drive_space_id.to_string(),
        drive_node_id,
        drive_uri,
        upload_profile_code: upload_profile_for_media_kind(artifact.kind).to_string(),
        upload_task_id,
        provider_asset_id: artifact.provider_asset_id.clone(),
        provider_uri: artifact.provider_uri.clone(),
        provider_url: artifact.provider_url.clone(),
        media_resource,
    })
}

pub fn media_kind_from_str(value: &str) -> MediaKind {
    match value.trim().to_ascii_lowercase().as_str() {
        "image" | "images" => MediaKind::Image,
        "video" | "videos" => MediaKind::Video,
        "audio" | "audios" => MediaKind::Audio,
        "voice" => MediaKind::Voice,
        "document" | "documents" => MediaKind::Document,
        "archive" | "archives" => MediaKind::Archive,
        "model" | "models" => MediaKind::Model,
        _ => MediaKind::Other,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sdkwork_assets_contract::{GenerationProvenance, ProviderRef};

    fn sample_batch() -> MediaArtifactBatch {
        MediaArtifactBatch {
            batch_id: "batch-1".to_string(),
            provenance: GenerationProvenance {
                modality: "image".to_string(),
                operation_type: "text_to_image".to_string(),
                generation_id: "gen-1".to_string(),
                scene: "playground_image".to_string(),
                provider: Some(ProviderRef {
                    provider_code: "openai".to_string(),
                    provider_asset_id: None,
                    provider_uri: None,
                    provider_url: Some("https://example.com/out.png".to_string()),
                }),
                model: Some("dall-e-3".to_string()),
            },
            artifacts: vec![MediaArtifact {
                index: 0,
                kind: MediaKind::Image,
                file_name: Some("out.png".to_string()),
                mime_type: Some("image/png".to_string()),
                size_bytes: Some(1024),
                width: Some(1024),
                height: Some(1024),
                duration_seconds: None,
                provider_asset_id: None,
                provider_uri: None,
                provider_url: Some("https://example.com/out.png".to_string()),
            }],
        }
    }

    #[test]
    fn plans_multi_item_drive_import_from_batch() {
        let plan = IngestionPlanBuilder::plan_drive_import(
            &sample_batch(),
            &DriveIngestContext {
                tenant_id: "tenant-1".to_string(),
                owner_subject_type: "user".to_string(),
                owner_subject_id: "user-1".to_string(),
                actor_type: "user".to_string(),
                actor_id: "user-1".to_string(),
                space_profile: DriveSpaceProfile::AiGenerated,
            },
        )
        .expect("plan");

        assert_eq!(plan.generation_id, "gen-1");
        assert_eq!(plan.items.len(), 1);
        assert!(plan.items[0].drive_uri.starts_with("drive://spaces/"));
        assert_eq!(plan.items[0].upload_profile_code, "image");
    }
}
