//! Provider adapter boundary for modality backend services.
//!
//! Domain services call provider capabilities through their canonical provider SPI and adapter.
//! Adapters may use an approved generated SDK, but domain services never call provider HTTP.
//!
//! Reference implementations:
//! - `sdkwork-image/crates/sdkwork-image-generation-provider-adapter`
//! - `sdkwork-video/crates/sdkwork-video-generation-provider-adapter`

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
pub struct ProviderAdapterProfile {
    pub adapter_id: &'static str,
    pub modality: &'static str,
}

impl ProviderAdapterProfile {
    pub const IMAGE: Self = Self {
        adapter_id: "sdkwork-image-generation-provider-adapter",
        modality: "image",
    };

    pub const VIDEO: Self = Self {
        adapter_id: "sdkwork-video-generation-provider-adapter",
        modality: "video",
    };

    pub const MUSIC: Self = Self {
        adapter_id: "sdkwork-music-generation-provider-adapter",
        modality: "music",
    };

    pub const VOICE: Self = Self {
        adapter_id: "sdkwork-voice-generation-provider-adapter",
        modality: "voice",
    };

    pub const SOUND_EFFECT: Self = Self {
        adapter_id: "sdkwork-audio-sound-effect-provider-adapter",
        modality: "sound-effect",
    };
}

/// Input from a modality service after provider adapter normalization.
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
                    provider_asset_id: self
                        .artifacts
                        .first()
                        .and_then(|item| item.provider_asset_id.clone()),
                    provider_uri: self
                        .artifacts
                        .first()
                        .and_then(|item| item.provider_uri.clone()),
                    provider_url: self
                        .artifacts
                        .first()
                        .and_then(|item| item.provider_url.clone()),
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

#[cfg(test)]
mod tests {
    use super::ProviderAdapterProfile;

    #[test]
    fn provider_profiles_expose_only_canonical_adapter_ids() {
        let profiles = [
            ProviderAdapterProfile::IMAGE,
            ProviderAdapterProfile::VIDEO,
            ProviderAdapterProfile::VOICE,
            ProviderAdapterProfile::MUSIC,
            ProviderAdapterProfile::SOUND_EFFECT,
        ];

        for profile in profiles {
            assert!(profile.adapter_id.starts_with("sdkwork-"));
            assert!(profile.adapter_id.ends_with("provider-adapter"));
            assert!(!profile.adapter_id.contains("clawrouter"));
            assert!(!profile.modality.is_empty());
        }
    }
}
