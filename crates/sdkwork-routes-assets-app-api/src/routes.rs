use axum::middleware;
use axum::routing::{get, post};
use axum::Router;
use sdkwork_drive_http::metrics::record_request_metrics;
use sdkwork_routes_drive_app_api::composition_host::{
    pagination_guard, rate_limit, state::AppState,
};
use sdkwork_routes_drive_app_api::constants::DEFAULT_DOWNLOAD_PUBLIC_BASE_URL;
use sqlx::PgPool;

use crate::handlers::{
    add_asset_collection_item, archive_asset, asset_method_not_allowed, create_asset,
    create_asset_collection, create_asset_relation, delete_asset_collection_item,
    delete_asset_relation, get_asset, legacy_asset_upload_route_gone, list_asset_collections,
    list_assets, restore_asset, update_asset,
};

fn build_business_router_layers(state: AppState) -> Router {
    let assets_routes = Router::new()
        .route("/app/v3/api/assets", get(list_assets).post(create_asset))
        .route(
            "/app/v3/api/assets/collections",
            get(list_asset_collections).post(create_asset_collection),
        )
        .route(
            "/app/v3/api/assets/collections/{collection_id}/items",
            post(add_asset_collection_item),
        )
        .route(
            "/app/v3/api/assets/collections/{collection_id}/items/{item_id}",
            post(asset_method_not_allowed).delete(delete_asset_collection_item),
        )
        .route(
            "/app/v3/api/assets/{asset_id}",
            get(get_asset).patch(update_asset),
        )
        .route("/app/v3/api/assets/{asset_id}/archive", post(archive_asset))
        .route("/app/v3/api/assets/{asset_id}/restore", post(restore_asset))
        .route(
            "/app/v3/api/assets/{asset_id}/relations",
            post(create_asset_relation),
        )
        .route(
            "/app/v3/api/assets/{asset_id}/relations/{relation_id}",
            post(asset_method_not_allowed).delete(delete_asset_relation),
        );

    let forbidden_asset_routes = Router::new()
        .route(
            "/app/v3/api/assets/upload",
            post(legacy_asset_upload_route_gone),
        )
        .route(
            "/app/v3/api/assets/presign",
            post(legacy_asset_upload_route_gone),
        )
        .route(
            "/app/v3/api/assets/upload_sessions",
            post(legacy_asset_upload_route_gone),
        );

    Router::new()
        .merge(
            assets_routes
                .merge(forbidden_asset_routes)
                .route_layer(middleware::from_fn(
                    pagination_guard::reject_legacy_pagination_query,
                ))
                .route_layer(middleware::from_fn(rate_limit::app_api_rate_limit)),
        )
        .layer(middleware::from_fn(
            sdkwork_drive_http::problem_correlation::problem_correlation_middleware,
        ))
        .with_state(state)
}

/// Business router for multi-surface gateway assembly (infra mounted once by assembly).
pub fn gateway_mount_business(pool: PgPool) -> Router {
    build_app_business_router(pool)
}

/// Raw App API router for a composing gateway that owns the Web Framework layer.
pub fn build_app_business_router(pool: PgPool) -> Router {
    let state = AppState::with_urls(
        pool,
        std::env::var("SDKWORK_DRIVE_PUBLIC_BASE_URL")
            .unwrap_or_else(|_| DEFAULT_DOWNLOAD_PUBLIC_BASE_URL.to_string()),
    );
    build_business_router_layers(state).layer(middleware::from_fn(record_request_metrics))
}

pub async fn gateway_mount(pool: PgPool) -> Router {
    sdkwork_routes_drive_app_api::wrap_router_with_web_framework_from_env(build_app_business_router(
        pool,
    ))
    .await
}
