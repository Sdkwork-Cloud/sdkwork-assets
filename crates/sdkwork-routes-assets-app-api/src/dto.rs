use serde::{Deserialize, Serialize};

pub const ASSET_NODE_SELECT_COLUMNS: &str = "\
    id, tenant_id, space_id, space_type, parent_node_id, shortcut_target_node_id, \
    node_type, node_name, scene, source, content_state, file_extension, \
    head_content_type, head_content_type_group, head_content_length, \
    lifecycle_status, version, CAST(created_at AS TEXT) AS created_at, CAST(updated_at AS TEXT) AS updated_at";

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListAssetsQuery {
    pub cursor: Option<String>,
    #[serde(rename = "page_size")]
    pub page_size: Option<i64>,
    pub kind: Option<String>,
    pub source_type: Option<String>,
    pub q: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateAssetRequest {
    pub drive_node_id: Option<String>,
    pub virtual_reference: Option<serde_json::Value>,
    pub title: Option<String>,
    pub description: Option<String>,
    pub scene: Option<String>,
    pub source: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateAssetRequest {
    pub title: Option<String>,
    pub description: Option<String>,
    pub scene: Option<String>,
    pub source: Option<String>,
    pub tags: Option<Vec<String>>,
    pub visibility: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetActionRequest {
    pub reason: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MediaResourceResponse {
    pub id: String,
    pub kind: String,
    pub source: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub mime_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub size_bytes: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetItemResponse {
    pub asset_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub tenant_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub organization_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_id: Option<String>,
    pub drive_space_id: String,
    pub drive_node_id: String,
    pub drive_uri: String,
    pub node_type: String,
    pub asset_kind: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scene: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tags: Option<Vec<String>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub visibility: Option<String>,
    pub lifecycle_status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub resource_snapshot: Option<MediaResourceResponse>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListAssetCollectionsQuery {
    pub cursor: Option<String>,
    #[serde(rename = "page_size")]
    pub page_size: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct CreateAssetCollectionRequest {
    pub title: String,
    pub description: Option<String>,
    pub collection_type: Option<String>,
    pub visibility: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetCollectionResponse {
    pub id: String,
    pub tenant_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub organization_id: Option<String>,
    pub user_id: String,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub collection_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub visibility: Option<String>,
    pub lifecycle_status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAssetCollectionItemRequest {
    pub asset_id: String,
    pub sort_order: Option<i64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetCollectionItemResponse {
    pub id: String,
    pub tenant_id: String,
    pub collection_id: String,
    pub asset_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sort_order: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateAssetRelationRequest {
    pub related_asset_id: Option<String>,
    pub relation_type: String,
    pub source_domain: Option<String>,
    pub source_resource_type: Option<String>,
    pub source_resource_id: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetRelationResponse {
    pub id: String,
    pub tenant_id: String,
    pub asset_id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub related_asset_id: Option<String>,
    pub relation_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_domain: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_resource_type: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source_resource_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<serde_json::Value>,
    pub lifecycle_status: String,
}
