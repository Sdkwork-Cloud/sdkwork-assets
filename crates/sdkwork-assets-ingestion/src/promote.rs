use sdkwork_assets_contract::{AssetCatalogRef, AssetLifecycleState, AssetSourceType, ImportedMediaArtifact};

use crate::plan::IngestionError;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AssetPromoteOptions {
    pub title: Option<String>,
    pub tags: Vec<String>,
    pub collection_id: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AssetPromoteRequest {
    pub tenant_id: String,
    pub imported: ImportedMediaArtifact,
    pub options: AssetPromoteOptions,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct AssetPromoteResult {
    pub asset_catalog: AssetCatalogRef,
}

pub fn build_ai_generated_catalog_ref(
    imported: &ImportedMediaArtifact,
) -> Result<AssetCatalogRef, IngestionError> {
    Ok(AssetCatalogRef {
        asset_id: imported.drive_node_id.clone(),
        drive_space_id: imported.drive_space_id.clone(),
        drive_node_id: imported.drive_node_id.clone(),
        drive_uri: imported.drive_uri.clone(),
        source_type: AssetSourceType::AiGenerated,
        lifecycle_state: AssetLifecycleState::Active,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use sdkwork_assets_contract::{MediaKind, MediaResource, MediaSource};

    #[test]
    fn builds_catalog_ref_from_imported_artifact() {
        let imported = ImportedMediaArtifact {
            index: 0,
            drive_space_id: "space-1".to_string(),
            drive_node_id: "node-1".to_string(),
            drive_uri: "drive://space-1/node-1".to_string(),
            media_resource: MediaResource {
                id: Some("node-1".to_string()),
                kind: MediaKind::Image,
                source: MediaSource::Drive,
                url: None,
                public_url: None,
                uri: Some("drive://space-1/node-1".to_string()),
                object_blob_id: None,
                file_name: Some("out.png".to_string()),
                mime_type: Some("image/png".to_string()),
                size_bytes: None,
                checksum: None,
                width: None,
                height: None,
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
            asset_catalog: None,
        };

        let catalog = build_ai_generated_catalog_ref(&imported).expect("catalog");
        assert_eq!(catalog.asset_id, "node-1");
        assert_eq!(catalog.source_type, AssetSourceType::AiGenerated);
    }
}
