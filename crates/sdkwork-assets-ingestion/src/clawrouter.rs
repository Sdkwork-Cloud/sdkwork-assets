//! ClawRouter integration boundary for modality backend services.
//!
//! Domain services (image, video, music, audio) MUST call provider capabilities through
//! `clawrouter_open_sdk::SdkworkAiClient` — never raw provider HTTP.
//!
//! Reference implementations:
//! - `sdkwork-image/crates/sdkwork-image-claw-router-provider-service`
//! - `sdkwork-video/crates/sdkwork-video-provider-claw-router-rust`

use sdkwork_assets_contract::{MediaArtifact, MediaArtifactBatch, MediaKind, ProviderRef};

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ProviderGenerationPhase {
    Dispatching,
    Submitted,
    Rendering,
    Normalizing,
    ReadyForDriveImport,
    Failed,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ClawRouterIntegrationProfile {
    pub open_sdk_crate: &'static str,
    pub modality: &'static str,
}

impl ClawRouterIntegrationProfile {
    pub const IMAGE: Self = Self {
        open_sdk_crate: "clawrouter_open_sdk",
        modality: "image",
    };

    pub const VIDEO: Self = Self {
        open_sdk_crate: "clawrouter_open_sdk",
        modality: "video",
    };

    pub const MUSIC: Self = Self {
        open_sdk_crate: "clawrouter_open_sdk",
        modality: "music",
    };

    pub const AUDIO: Self = Self {
        open_sdk_crate: "clawrouter_open_sdk",
        modality: "audio",
    };
}

/// Input from a modality service after ClawRouter SDK normalization.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NormalizedProviderBatchInput {
    pub batch_id: String,
    pub generation_id: String,
    pub modality: String,
    pub operation_type: String,
    pub scene: String,
    pub provider_code: String,
    pub model: Option<String>,
    pub phase: ProviderGenerationPhase,
    pub artifacts: Vec<NormalizedProviderArtifact>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NormalizedProviderArtifact {
    pub index: i32,
    pub kind: MediaKind,
    pub file_name: Option<String>,
    pub mime_type: Option<String>,
    pub size_bytes: Option<i64>,
    pub width: Option<i32>,
    pub height: Option<i32>,
    pub duration_seconds: Option<i32>,
    pub provider_asset_id: Option<String>,
    pub provider_uri: Option<String>,
    pub provider_url: Option<String>,
}

impl NormalizedProviderBatchInput {
    pub fn into_media_artifact_batch(self) -> Result<MediaArtifactBatch, &'static str> {
        if self.artifacts.is_empty() {
            return Err("artifacts must not be empty");
        }
        let batch = MediaArtifactBatch {
            batch_id: self.batch_id,
            provenance: sdkwork_assets_contract::GenerationProvenance {
                modality: self.modality,
                operation_type: self.operation_type,
                generation_id: self.generation_id,
                scene: self.scene,
                provider: Some(ProviderRef {
                    provider_code: self.provider_code,
                    provider_asset_id: self.artifacts.first().and_then(|item| item.provider_asset_id.clone()),
                    provider_uri: self.artifacts.first().and_then(|item| item.provider_uri.clone()),
                    provider_url: self.artifacts.first().and_then(|item| item.provider_url.clone()),
                }),
                model: self.model,
            },
            artifacts: self
                .artifacts
                .into_iter()
                .map(|artifact| MediaArtifact {
                    index: artifact.index,
                    kind: artifact.kind,
                    file_name: artifact.file_name,
                    mime_type: artifact.mime_type,
                    size_bytes: artifact.size_bytes,
                    width: artifact.width,
                    height: artifact.height,
                    duration_seconds: artifact.duration_seconds,
                    provider_asset_id: artifact.provider_asset_id,
                    provider_uri: artifact.provider_uri,
                    provider_url: artifact.provider_url,
                })
                .collect(),
        };
        batch.validate()?;
        Ok(batch)
    }
}
