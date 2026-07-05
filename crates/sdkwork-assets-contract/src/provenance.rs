use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderRef {
    pub provider_code: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_asset_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_uri: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider_url: Option<String>,
}

#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerationProvenance {
    pub modality: String,
    pub operation_type: String,
    pub generation_id: String,
    pub scene: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub provider: Option<ProviderRef>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
}
