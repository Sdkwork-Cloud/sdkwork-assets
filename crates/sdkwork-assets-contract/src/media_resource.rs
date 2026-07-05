use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::media_kind::{MediaKind, MediaSource};

#[derive(Debug, Error, PartialEq, Eq)]
pub enum MediaResourceError {
    #[error("media resource kind is required")]
    MissingKind,
    #[error("media resource source is required")]
    MissingSource,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaChecksum {
    pub algorithm: String,
    pub value: String,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MediaAccessVisibility {
    Private,
    Tenant,
    Organization,
    Public,
    Signed,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaAccess {
    pub visibility: MediaAccessVisibility,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<String>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MediaAiProvenanceKind {
    Uploaded,
    Generated,
    Edited,
    Imported,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MediaModerationStatus {
    Unknown,
    Pending,
    Approved,
    Rejected,
    Blocked,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaAiProvenance {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provenance: Option<MediaAiProvenanceKind>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prompt_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub generation_task_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_media_ids: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub moderation_status: Option<MediaModerationStatus>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub safety_labels: Option<Vec<String>>,
}

/// Canonical business-state media descriptor per MEDIA_RESOURCE_SPEC §3.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaResource {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub kind: MediaKind,
    pub source: MediaSource,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub object_blob_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mime_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub size_bytes: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub checksum: Option<MediaChecksum>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub width: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub height: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub duration_seconds: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub alt_text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub poster: Option<Box<MediaResource>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnails: Option<Vec<MediaResource>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub variants: Option<Vec<MediaResource>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub access: Option<MediaAccess>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ai: Option<MediaAiProvenance>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
}

impl MediaResource {
    pub fn validate(&self) -> Result<(), MediaResourceError> {
        let _ = self.kind;
        let _ = self.source;
        Ok(())
    }
}

pub fn media_kind_to_asset_kind(kind: MediaKind) -> &'static str {
    match kind {
        MediaKind::Image => "image",
        MediaKind::Video => "video",
        MediaKind::Audio | MediaKind::Voice => "audio",
        MediaKind::Document => "document",
        MediaKind::Model => "model",
        MediaKind::Archive => "file",
        MediaKind::Other => "other",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn maps_media_kind_to_drive_asset_kind() {
        assert_eq!(media_kind_to_asset_kind(MediaKind::Voice), "audio");
        assert_eq!(media_kind_to_asset_kind(MediaKind::Model), "model");
        assert_eq!(media_kind_to_asset_kind(MediaKind::Archive), "file");
    }
}
