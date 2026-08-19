mod dto;
mod handlers;
pub mod http_route_manifest;
mod routes;

pub use http_route_manifest::app_route_manifest;
pub use routes::{build_app_business_router, gateway_mount, gateway_mount_business};

pub fn gateway_route_manifest() -> sdkwork_web_core::HttpRouteManifest {
    app_route_manifest()
}
