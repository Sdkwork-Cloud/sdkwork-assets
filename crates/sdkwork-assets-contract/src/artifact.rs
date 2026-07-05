use serde::{Deserialize, Serialize};

use crate::media_kind::MediaKind;
use crate::media_resource::MediaResource;
use crate::provenance::GenerationProvenance;

/// Transient provider-normalized artifact before Drive import.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaArtifact {
    pub index: i32,
    pub kind: MediaKind,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mime_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub size_bytes: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_seconds: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_asset_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_url: Option<String>,
}

/// One provider invocation may yield multiple artifacts (image grids, music variants, etc.).
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaArtifactBatch {
    pub batch_id: String,
    pub provenance: GenerationProvenance,
    pub artifacts: Vec<MediaArtifact>,
}

impl MediaArtifactBatch {
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.batch_id.trim().is_empty() {
            return Err("batch_id is required");
        }
        if self.artifacts.is_empty() {
            return Err("artifacts must not be empty");
        }
        let mut seen = std::collections::BTreeSet::new();
        for artifact in &self.artifacts {
            if artifact.index < 0 {
                return Err("artifact index must be non-negative");
            }
            if !seen.insert(artifact.index) {
                return Err("artifact index must be unique within batch");
            }
        }
        Ok(())
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AssetSourceType {
    Upload,
    AiGenerated,
    Imported,
    Edited,
    System,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AssetLifecycleState {
    Active,
    Archived,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetCatalogRef {
    /// Global asset id — alias of Drive node id per Drive global-assets contract.
    pub asset_id: String,
    pub drive_space_id: String,
    pub drive_node_id: String,
    pub drive_uri: String,
    pub source_type: AssetSourceType,
    pub lifecycle_state: AssetLifecycleState,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportedMediaArtifact {
    pub index: i32,
    pub drive_space_id: String,
    pub drive_node_id: String,
    pub drive_uri: String,
    pub media_resource: MediaResource,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub asset_catalog: Option<AssetCatalogRef>,
}
