//! Maps [`DriveImportItemPlan`] to Drive uploader commands and executes byte uploads.
//!
//! Authority: `DRIVE_SPEC.md`, `sdkwork-image-generation-service` drive import helpers.

use sdkwork_assets_ingestion::{DriveImportItemPlan, DriveImportPlan, DriveIngestContext, IngestionError};
use sdkwork_drive_workspace_service::uploader::{
    PrepareUploaderUploadCommand, UploadBytesCommand, UploaderActor, UploaderRetention,
    UploaderTarget,
};

pub const DEFAULT_GENERATED_MEDIA_CHUNK_SIZE_BYTES: i64 = 8 * 1024 * 1024;

#[derive(Debug, thiserror::Error, PartialEq, Eq)]
pub enum DriveUploaderError {
    #[error("drive uploader validation failed: {0}")]
    Validation(&'static str),
    #[error("drive uploader execution failed: {0}")]
    Execution(&'static str),
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DriveUploaderContext {
    pub tenant_id: String,
    pub organization_id: Option<String>,
    pub operator_id: String,
    pub now_epoch_ms: i64,
    pub app_id: String,
    pub app_resource_type: String,
}

impl DriveUploaderContext {
    pub fn ai_generation_output(app_id: impl Into<String>) -> Self {
        Self {
            tenant_id: String::new(),
            organization_id: None,
            operator_id: String::new(),
            now_epoch_ms: 0,
            app_id: app_id.into(),
            app_resource_type: "ai_generation_output".to_string(),
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct DriveImportExecutionContext {
    pub uploader: DriveUploaderContext,
    pub ingest: DriveIngestContext,
}

pub fn build_prepare_commands_for_import_plan(
    plan: &DriveImportPlan,
    context: &DriveImportExecutionContext,
) -> Result<Vec<PrepareUploaderUploadCommand>, DriveUploaderError> {
    plan.items
        .iter()
        .map(|item| build_prepare_uploader_command(item, plan, context))
        .collect()
}

pub fn build_prepare_uploader_command(
    item: &DriveImportItemPlan,
    plan: &DriveImportPlan,
    context: &DriveImportExecutionContext,
) -> Result<PrepareUploaderUploadCommand, DriveUploaderError> {
    let tenant_id = require_trimmed(
        &context.uploader.tenant_id,
        "drive uploader tenant_id is required",
    )?;
    let operator_id = require_trimmed(
        &context.uploader.operator_id,
        "drive uploader operator_id is required",
    )?;
    if context.uploader.now_epoch_ms <= 0 {
        return Err(DriveUploaderError::Validation(
            "drive uploader now_epoch_ms must be greater than 0",
        ));
    }
    let scene = require_trimmed(&item.scene, "drive uploader scene is required")?;
    let file_name = item
        .media_resource
        .file_name
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .ok_or(DriveUploaderError::Validation(
            "drive uploader file_name is required",
        ))?;
    let content_type = item
        .media_resource
        .mime_type
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_ascii_lowercase)
        .unwrap_or_else(|| default_content_type_for_profile(&item.upload_profile_code).to_string());

    let upload_id = item
        .drive_node_id
        .strip_prefix("node-")
        .unwrap_or(&item.drive_node_id)
        .to_string();

    Ok(PrepareUploaderUploadCommand {
        id: upload_id,
        task_id: item.upload_task_id.clone(),
        tenant_id: tenant_id.to_string(),
        organization_id: context
            .uploader
            .organization_id
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
            .map(str::to_string),
        actor: uploader_actor_from_ingest_context(&context.ingest)?,
        app_id: context.uploader.app_id.clone(),
        app_resource_type: context.uploader.app_resource_type.clone(),
        app_resource_id: format!("{}:{}", plan.generation_id, item.output_index),
        scene: Some(scene.to_string()),
        source: Some("ai_generated".to_string()),
        upload_profile_code: item.upload_profile_code.clone(),
        file_fingerprint: format!(
            "{}:ai-generated:{}:{}",
            context.uploader.app_id,
            stable_identifier_suffix(&plan.generation_id),
            item.output_index
        ),
        original_file_name: file_name.to_string(),
        content_type,
        content_length: parse_content_length(item.media_resource.size_bytes.as_deref())?,
        chunk_size_bytes: DEFAULT_GENERATED_MEDIA_CHUNK_SIZE_BYTES,
        target: UploaderTarget::AiGeneratedSpace {
            parent_node_id: None,
        },
        retention: UploaderRetention::LongTerm,
        operator_id: operator_id.to_string(),
        now_epoch_ms: context.uploader.now_epoch_ms,
    })
}

pub fn build_upload_bytes_command(
    item: &DriveImportItemPlan,
    plan: &DriveImportPlan,
    context: &DriveImportExecutionContext,
    body: Vec<u8>,
) -> Result<UploadBytesCommand, DriveUploaderError> {
    Ok(UploadBytesCommand {
        prepare: build_prepare_uploader_command(item, plan, context)?,
        body,
        uploaded_at_epoch_ms: context.uploader.now_epoch_ms,
    })
}

fn uploader_actor_from_ingest_context(
    context: &DriveIngestContext,
) -> Result<UploaderActor, DriveUploaderError> {
    let actor_id = require_trimmed(&context.actor_id, "drive ingest actor_id is required")?;
    match context.actor_type.as_str() {
        "user" => Ok(UploaderActor::User {
            user_id: actor_id.to_string(),
        }),
        "anonymous" => Ok(UploaderActor::Anonymous {
            anonymous_id: actor_id.to_string(),
        }),
        "system" => Ok(UploaderActor::System {
            operator_id: actor_id.to_string(),
        }),
        _ => Err(DriveUploaderError::Validation(
            "drive ingest actor_type is not supported",
        )),
    }
}

impl From<DriveUploaderError> for IngestionError {
    fn from(error: DriveUploaderError) -> Self {
        match error {
            DriveUploaderError::Validation(message) => IngestionError::InvalidBatch(message),
            DriveUploaderError::Execution(message) => IngestionError::InvalidBatch(message),
        }
    }
}

fn default_content_type_for_profile(upload_profile_code: &str) -> &'static str {
    match upload_profile_code {
        "image" => "image/png",
        "video" => "video/mp4",
        "audio" => "audio/mpeg",
        "document" => "application/octet-stream",
        _ => "application/octet-stream",
    }
}

fn parse_content_length(value: Option<&str>) -> Result<i64, DriveUploaderError> {
    let Some(value) = value.map(str::trim).filter(|value| !value.is_empty()) else {
        return Ok(0);
    };
    let parsed = value
        .parse::<i64>()
        .map_err(|_| DriveUploaderError::Validation("size_bytes must be a non-negative integer"))?;
    if parsed < 0 {
        Err(DriveUploaderError::Validation(
            "size_bytes must be a non-negative integer",
        ))
    } else {
        Ok(parsed)
    }
}

fn require_trimmed<'a>(value: &'a str, error: &'static str) -> Result<&'a str, DriveUploaderError> {
    let value = value.trim();
    if value.is_empty() {
        Err(DriveUploaderError::Validation(error))
    } else {
        Ok(value)
    }
}

fn stable_identifier_suffix(value: &str) -> String {
    sdkwork_assets_ingestion::stable_identifier_suffix(value)
}

#[cfg(test)]
mod tests {
    use super::*;
    use sdkwork_assets_contract::{MediaKind, MediaResource, MediaSource};
    use sdkwork_assets_ingestion::{DriveImportPlan, DriveIngestContext};

    fn sample_item() -> DriveImportItemPlan {
        DriveImportItemPlan {
            output_index: 0,
            scene: "playground_image".to_string(),
            drive_space_id: "space-ai-generated-user-user-1".to_string(),
            drive_node_id: "node-ai-generated-gen-1-0".to_string(),
            drive_uri: "drive://spaces/space-ai-generated-user-user-1/nodes/node-ai-generated-gen-1-0"
                .to_string(),
            upload_profile_code: "image".to_string(),
            upload_task_id: "image-generation-gen-1-0".to_string(),
            provider_asset_id: None,
            provider_uri: None,
            provider_url: Some("https://example.com/out.png".to_string()),
            media_resource: MediaResource {
                id: Some("node-ai-generated-gen-1-0".to_string()),
                kind: MediaKind::Image,
                source: MediaSource::Drive,
                url: None,
                public_url: None,
                uri: Some(
                    "drive://spaces/space-ai-generated-user-user-1/nodes/node-ai-generated-gen-1-0"
                        .to_string(),
                ),
                object_blob_id: None,
                file_name: Some("out.png".to_string()),
                mime_type: Some("image/png".to_string()),
                size_bytes: Some("1024".to_string()),
                checksum: None,
                width: Some(1024),
                height: Some(1024),
                duration_seconds: None,
                alt_text: None,
                title: None,
                poster: None,
                thumbnails: None,
                variants: None,
                access: None,
                ai: None,
                metadata: None,
            },
        }
    }

    #[test]
    fn builds_prepare_uploader_command_for_ai_generated_import() {
        let plan = DriveImportPlan {
            generation_id: "gen-1".to_string(),
            provider_code: "openai".to_string(),
            items: vec![sample_item()],
        };
        let command = build_prepare_uploader_command(
            &plan.items[0],
            &plan,
            &DriveImportExecutionContext {
                uploader: DriveUploaderContext {
                    tenant_id: "tenant-1".to_string(),
                    organization_id: None,
                    operator_id: "user-1".to_string(),
                    now_epoch_ms: 1_700_000_000_000,
                    app_id: "sdkwork-image".to_string(),
                    app_resource_type: "ai_generation_output".to_string(),
                },
                ingest: DriveIngestContext {
                    tenant_id: "tenant-1".to_string(),
                    owner_subject_type: "user".to_string(),
                    owner_subject_id: "user-1".to_string(),
                    actor_type: "user".to_string(),
                    actor_id: "user-1".to_string(),
                    space_profile: sdkwork_assets_ingestion::DriveSpaceProfile::AiGenerated,
                },
            },
        )
        .expect("command");

        assert_eq!(command.upload_profile_code, "image");
        assert_eq!(command.source.as_deref(), Some("ai_generated"));
        assert_eq!(command.app_resource_id, "gen-1:0");
        assert!(matches!(command.target, UploaderTarget::AiGeneratedSpace { .. }));
    }
}
