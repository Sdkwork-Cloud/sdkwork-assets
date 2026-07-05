use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MediaKind {
    Image,
    Video,
    Audio,
    Voice,
    Document,
    Archive,
    Model,
    Other,
}

impl MediaKind {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Image => "image",
            Self::Video => "video",
            Self::Audio => "audio",
            Self::Voice => "voice",
            Self::Document => "document",
            Self::Archive => "archive",
            Self::Model => "model",
            Self::Other => "other",
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MediaSource {
    Drive,
    ExternalUrl,
    DataUrl,
    ProviderAsset,
    Generated,
}

impl MediaSource {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Drive => "drive",
            Self::ExternalUrl => "external_url",
            Self::DataUrl => "data_url",
            Self::ProviderAsset => "provider_asset",
            Self::Generated => "generated",
        }
    }
}
