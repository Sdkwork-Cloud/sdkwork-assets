//! Drive `ai_generated` space layout per MEDIA_RESOURCE_SPEC and sdkwork-image production conventions.

use sdkwork_assets_contract::MediaKind;

pub fn stable_identifier_suffix(value: &str) -> String {
    value
        .trim()
        .chars()
        .map(|ch| {
            if ch.is_ascii_alphanumeric() {
                ch.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>()
        .trim_matches('-')
        .chars()
        .take(48)
        .collect()
}

pub fn build_ai_generated_space_id(owner_subject_type: &str, owner_subject_id: &str) -> String {
    format!(
        "space-ai-generated-{}-{}",
        stable_identifier_suffix(owner_subject_type),
        stable_identifier_suffix(owner_subject_id)
    )
}

pub fn build_ai_generated_node_id(generation_id: &str, output_index: i32) -> String {
    format!(
        "node-ai-generated-{}-{}",
        stable_identifier_suffix(generation_id),
        output_index
    )
}

pub fn build_drive_uri(space_id: &str, node_id: &str) -> String {
    format!("drive://spaces/{space_id}/nodes/{node_id}")
}

pub fn build_upload_task_id(modality: &str, generation_id: &str, output_index: i32) -> String {
    format!(
        "{}-generation-{}-{}",
        stable_identifier_suffix(modality),
        stable_identifier_suffix(generation_id),
        output_index
    )
}

pub fn upload_profile_for_media_kind(kind: MediaKind) -> &'static str {
    match kind {
        MediaKind::Image => "image",
        MediaKind::Video => "video",
        MediaKind::Audio | MediaKind::Voice => "audio",
        MediaKind::Document => "document",
        MediaKind::Model | MediaKind::Archive | MediaKind::Other => "generic",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn drive_uri_follows_media_resource_spec() {
        let uri = build_drive_uri("space-1", "node-1");
        assert_eq!(uri, "drive://spaces/space-1/nodes/node-1");
    }
}
