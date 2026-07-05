//! Bridges `sdkwork-image-generation-service` outputs to unified assets contracts.

use sdkwork_assets_contract::{
    GenerationProvenance, MediaArtifact, MediaArtifactBatch, MediaKind, ProviderRef,
};
use sdkwork_assets_ingestion::{
    DriveImportPlan, DriveIngestContext, IngestionPlanBuilder, media_kind_from_str,
};
use sdkwork_image_generation_service::{
    DriveGeneratedMediaContext, DriveGeneratedMediaImportPlan, GeneratedMediaKind,
    GeneratedMediaOutput, ImageGenerationActor,
};

pub const IMAGE_MODALITY: &str = "image";

pub fn media_kind_from_generated(kind: GeneratedMediaKind) -> MediaKind {
    media_kind_from_str(kind.as_media_kind())
}

pub fn drive_ingest_context_from_image_actor(
    tenant_id: impl Into<String>,
    actor: &ImageGenerationActor,
) -> Result<DriveIngestContext, &'static str> {
    let tenant_id = tenant_id.into();
    if tenant_id.trim().is_empty() {
        return Err("image drive ingest tenant_id is required");
    }
    match actor {
        ImageGenerationActor::User { user_id } => {
            let user_id = require_trimmed(user_id, "image drive ingest user_id is required")?;
            Ok(DriveIngestContext {
                tenant_id,
                owner_subject_type: "user".to_string(),
                owner_subject_id: user_id.to_string(),
                actor_type: "user".to_string(),
                actor_id: user_id.to_string(),
                space_profile: sdkwork_assets_ingestion::DriveSpaceProfile::AiGenerated,
            })
        }
        ImageGenerationActor::Anonymous { anonymous_id } => {
            let anonymous_id =
                require_trimmed(anonymous_id, "image drive ingest anonymous_id is required")?;
            Ok(DriveIngestContext {
                tenant_id,
                owner_subject_type: "app".to_string(),
                owner_subject_id: "app:sdkwork-image:anonymous".to_string(),
                actor_type: "anonymous".to_string(),
                actor_id: anonymous_id.to_string(),
                space_profile: sdkwork_assets_ingestion::DriveSpaceProfile::AiGenerated,
            })
        }
        ImageGenerationActor::System { operator_id } => {
            let operator_id =
                require_trimmed(operator_id, "image drive ingest operator_id is required")?;
            Ok(DriveIngestContext {
                tenant_id,
                owner_subject_type: "app".to_string(),
                owner_subject_id: "app:sdkwork-image:system".to_string(),
                actor_type: "system".to_string(),
                actor_id: operator_id.to_string(),
                space_profile: sdkwork_assets_ingestion::DriveSpaceProfile::AiGenerated,
            })
        }
    }
}

pub fn media_artifact_batch_from_image_outputs(
    context: &DriveGeneratedMediaContext,
    operation_type: impl Into<String>,
    outputs: &[GeneratedMediaOutput],
) -> Result<MediaArtifactBatch, &'static str> {
    if outputs.is_empty() {
        return Err("image outputs are required");
    }
    let generation_id = require_trimmed(&context.generation_id, "image generation_id is required")?;
    let provider_code =
        require_trimmed(&context.provider_code, "image provider_code is required")?;
    let scene = require_trimmed(&context.scene, "image scene is required")?;

    Ok(MediaArtifactBatch {
        batch_id: format!("batch-{generation_id}"),
        provenance: GenerationProvenance {
            modality: IMAGE_MODALITY.to_string(),
            operation_type: operation_type.into(),
            generation_id: generation_id.to_string(),
            scene: scene.to_string(),
            provider: Some(ProviderRef {
                provider_code: provider_code.to_string(),
                provider_asset_id: outputs.first().and_then(|item| item.provider_asset_id.clone()),
                provider_uri: outputs.first().and_then(|item| item.provider_uri.clone()),
                provider_url: outputs.first().and_then(|item| item.provider_url.clone()),
            }),
            model: context
                .model
                .as_deref()
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(str::to_string),
        },
        artifacts: outputs
            .iter()
            .map(|output| MediaArtifact {
                index: output.output_index,
                kind: media_kind_from_generated(output.kind),
                file_name: output.file_name.clone(),
                mime_type: output.mime_type.clone(),
                size_bytes: output.size_bytes,
                width: output.width,
                height: output.height,
                duration_seconds: output.duration_seconds,
                provider_asset_id: output.provider_asset_id.clone(),
                provider_uri: output.provider_uri.clone(),
                provider_url: output.provider_url.clone(),
            })
            .collect(),
    })
}

pub fn plan_unified_assets_drive_import_from_image(
    context: &DriveGeneratedMediaContext,
    operation_type: impl Into<String>,
    outputs: &[GeneratedMediaOutput],
) -> Result<DriveImportPlan, sdkwork_assets_ingestion::IngestionError> {
    let batch = media_artifact_batch_from_image_outputs(context, operation_type, outputs)
        .map_err(|message| sdkwork_assets_ingestion::IngestionError::InvalidBatch(message))?;
    let ingest_context =
        drive_ingest_context_from_image_actor(context.tenant_id.clone(), &context.actor)
            .map_err(|message| sdkwork_assets_ingestion::IngestionError::InvalidBatch(message))?;
    IngestionPlanBuilder::plan_drive_import(&batch, &ingest_context)
}

pub fn assert_image_drive_plans_match_assets(
    image_plans: &[DriveGeneratedMediaImportPlan],
    assets_plan: &DriveImportPlan,
) -> Result<(), &'static str> {
    if image_plans.len() != assets_plan.items.len() {
        return Err("image and assets drive import item counts must match");
    }
    for (image_plan, assets_item) in image_plans.iter().zip(assets_plan.items.iter()) {
        if image_plan.generation_id != assets_plan.generation_id {
            return Err("image and assets generation_id must match");
        }
        if image_plan.output_index != assets_item.output_index {
            return Err("image and assets output_index must match");
        }
        if image_plan.drive_space_id != assets_item.drive_space_id {
            return Err("image and assets drive_space_id must match");
        }
        if image_plan.drive_node_id != assets_item.drive_node_id {
            return Err("image and assets drive_node_id must match");
        }
        if image_plan.drive_uri != assets_item.drive_uri {
            return Err("image and assets drive_uri must match");
        }
        if image_plan.drive_upload_profile_code != assets_item.upload_profile_code {
            return Err("image and assets upload_profile_code must match");
        }
        if image_plan.drive_upload_task_id != assets_item.upload_task_id {
            return Err("image and assets upload_task_id must match");
        }
    }
    Ok(())
}

fn require_trimmed<'a>(value: &'a str, error: &'static str) -> Result<&'a str, &'static str> {
    let value = value.trim();
    if value.is_empty() {
        Err(error)
    } else {
        Ok(value)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use sdkwork_image_generation_service::{
        build_drive_uploader_command_for_generated_output, plan_drive_import_for_generated_outputs,
        DriveGeneratedMediaContext, GeneratedMediaKind, GeneratedMediaOutput, IMAGE_WORKSPACE,
        ImageGenerationActor,
    };
    use sdkwork_assets_ingestion_drive::{
        build_prepare_uploader_command, DriveImportExecutionContext, DriveUploaderContext,
    };

    fn sample_context() -> DriveGeneratedMediaContext {
        DriveGeneratedMediaContext {
            tenant_id: "tenant-1".to_string(),
            organization_id: None,
            generation_id: "gen-abc-123".to_string(),
            provider_code: "openai".to_string(),
            model: Some("dall-e-3".to_string()),
            scene: "playground_image".to_string(),
            actor: ImageGenerationActor::User {
                user_id: "user-1".to_string(),
            },
        }
    }

    fn sample_outputs() -> Vec<GeneratedMediaOutput> {
        vec![
            GeneratedMediaOutput {
                output_index: 0,
                kind: GeneratedMediaKind::Image,
                provider_asset_id: None,
                provider_uri: None,
                provider_url: Some("https://example.com/a.png".to_string()),
                file_name: Some("a.png".to_string()),
                mime_type: Some("image/png".to_string()),
                size_bytes: Some(2048),
                width: Some(1024),
                height: Some(768),
                duration_seconds: None,
            },
            GeneratedMediaOutput {
                output_index: 1,
                kind: GeneratedMediaKind::Image,
                provider_asset_id: None,
                provider_uri: None,
                provider_url: Some("https://example.com/b.png".to_string()),
                file_name: Some("b.png".to_string()),
                mime_type: Some("image/png".to_string()),
                size_bytes: Some(4096),
                width: Some(1024),
                height: Some(768),
                duration_seconds: None,
            },
        ]
    }

    #[test]
    fn unified_assets_plan_matches_image_drive_import_plans() {
        let context = sample_context();
        let outputs = sample_outputs();
        let image_plans =
            plan_drive_import_for_generated_outputs(context.clone(), outputs.clone())
                .expect("image plans");
        let assets_plan = plan_unified_assets_drive_import_from_image(
            &context,
            "text_to_image",
            &outputs,
        )
        .expect("assets plan");

        assert_image_drive_plans_match_assets(&image_plans, &assets_plan).expect("aligned");
    }

    #[test]
    fn unified_assets_uploader_command_matches_image_native_builder() {
        let context = DriveGeneratedMediaContext {
            tenant_id: "100001".to_string(),
            organization_id: Some("0".to_string()),
            generation_id: "generation-001".to_string(),
            provider_code: "openai".to_string(),
            model: Some("gpt-image-1".to_string()),
            scene: "product_hero".to_string(),
            actor: ImageGenerationActor::User {
                user_id: "user-001".to_string(),
            },
        };
        let outputs = vec![GeneratedMediaOutput {
            output_index: 0,
            kind: GeneratedMediaKind::Image,
            provider_asset_id: Some("provider-image-001".to_string()),
            provider_uri: Some("provider://openai/images/provider-image-001".to_string()),
            provider_url: Some("https://provider.example.com/temporary-image.png".to_string()),
            file_name: Some("hero.png".to_string()),
            mime_type: Some("image/png".to_string()),
            size_bytes: Some(2048),
            width: Some(1024),
            height: Some(1024),
            duration_seconds: None,
        }];
        let image_plans =
            plan_drive_import_for_generated_outputs(context.clone(), outputs.clone())
                .expect("image plans");
        let assets_plan = plan_unified_assets_drive_import_from_image(
            &context,
            "text_to_image",
            &outputs,
        )
        .expect("assets plan");
        let ingest = drive_ingest_context_from_image_actor(context.tenant_id.clone(), &context.actor)
            .expect("ingest");
        let assets_command = build_prepare_uploader_command(
            &assets_plan.items[0],
            &assets_plan,
            &DriveImportExecutionContext {
                uploader: DriveUploaderContext {
                    tenant_id: context.tenant_id.clone(),
                    organization_id: context.organization_id.clone(),
                    operator_id: "operator-001".to_string(),
                    now_epoch_ms: 1_780_000_000_000,
                    app_id: IMAGE_WORKSPACE.to_string(),
                    app_resource_type: "ai_generation_output".to_string(),
                },
                ingest,
            },
        )
        .expect("assets uploader command");
        let image_command = build_drive_uploader_command_for_generated_output(
            &image_plans[0],
            &context.tenant_id,
            context.organization_id.as_deref(),
            "operator-001",
            1_780_000_000_000,
        )
        .expect("image uploader command");

        assert_eq!(assets_command.scene, image_command.scene);
        assert_eq!(assets_command.source, image_command.source);
        assert_eq!(assets_command.app_id, image_command.app_id);
        assert_eq!(assets_command.app_resource_type, image_command.app_resource_type);
        assert_eq!(assets_command.app_resource_id, image_command.app_resource_id);
        assert_eq!(assets_command.upload_profile_code, image_command.upload_profile_code);
        assert_eq!(assets_command.original_file_name, image_command.original_file_name);
        assert_eq!(assets_command.content_type, image_command.content_type);
        assert_eq!(assets_command.content_length, image_command.content_length);
        assert_eq!(assets_command.chunk_size_bytes, image_command.chunk_size_bytes);
        assert_eq!(format!("{:?}", assets_command.actor), format!("{:?}", image_command.actor));
        assert_eq!(format!("{:?}", assets_command.target), format!("{:?}", image_command.target));
    }
}
