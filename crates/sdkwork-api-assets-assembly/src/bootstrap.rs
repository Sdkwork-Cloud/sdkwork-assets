//! Gateway bootstrap for sdkwork-assets.

use std::sync::Arc;

use axum::Router;
use sdkwork_database_sqlx::DatabasePool;
use sdkwork_drive_http::infra::PostgresReadinessCheck;
use sdkwork_drive_workspace_service::bootstrap::bootstrap_drive_database;
pub use sdkwork_web_bootstrap::ApiAssemblyContribution;
use sdkwork_web_bootstrap::ReadinessCheck;
use sdkwork_web_core::HttpRouteManifest;

pub type ApiAssembly = ApiAssemblyContribution;

fn assemble_business_routes(pool: sqlx::PgPool) -> Router {
    sdkwork_routes_assets_app_api::gateway_mount_business(pool)
}

fn build_api_contribution(
    router: Router,
    readiness_check: Arc<dyn ReadinessCheck>,
) -> Result<ApiAssembly, String> {
    ApiAssemblyContribution::from_openapi_documents(
        "sdkwork-assets",
        "SDKWork Assets App API",
        router,
        build_route_manifest(),
        openapi_documents()?,
        vec![sdkwork_routes_drive_app_api::drive_app_context_injector()],
        readiness_check,
    )
}

fn openapi_documents() -> Result<Vec<serde_json::Value>, String> {
    [(
        "sdkwork-assets-app-api",
        include_str!("../../../apis/app-api/assets/assets-app-api.openapi.json"),
    )]
    .into_iter()
    .map(|(owner, source)| {
        serde_json::from_str(source).map_err(|error| format!("invalid {owner} OpenAPI: {error}"))
    })
    .collect()
}

/// Assemble the assets application router from environment variables.
pub async fn assemble_api_router() -> Result<ApiAssembly, String> {
    let host = bootstrap_drive_database_from_env().await?;
    let pool = host
        .pool()
        .as_postgres()
        .ok_or_else(|| "Assets assembly requires PostgreSQL".to_string())?
        .clone();
    build_api_contribution(
        assemble_business_routes(pool.clone()),
        Arc::new(PostgresReadinessCheck::new(pool)),
    )
}

/// Assemble the assets application router against a caller-provided database pool
/// so the platform cloud gateway can share its process-wide PostgreSQL pool.
pub async fn assemble_api_router_with_pool(pool: DatabasePool) -> Result<ApiAssembly, String> {
    let host = bootstrap_drive_database(pool).await?;
    let pool = host
        .pool()
        .as_postgres()
        .ok_or_else(|| "Assets assembly requires PostgreSQL".to_string())?
        .clone();
    build_api_contribution(
        assemble_business_routes(pool.clone()),
        Arc::new(PostgresReadinessCheck::new(pool)),
    )
}

async fn bootstrap_drive_database_from_env(
) -> Result<sdkwork_drive_workspace_service::bootstrap::DriveDatabaseHost, String> {
    sdkwork_drive_workspace_service::bootstrap::bootstrap_drive_database_from_env().await
}

/// Runs the Drive-owned database lifecycle without constructing HTTP routes.
pub async fn bootstrap_database_from_env() -> Result<(), String> {
    bootstrap_drive_database_from_env().await.map(|_| ())
}

/// Builds the Assets App API contribution for gateway composition.
pub async fn assemble_app_api_contribution() -> Result<ApiAssemblyContribution, String> {
    assemble_api_router().await
}

pub async fn assemble_app_api_contribution_with_pool(
    pool: DatabasePool,
) -> Result<ApiAssemblyContribution, String> {
    assemble_api_router_with_pool(pool).await
}

fn build_route_manifest() -> HttpRouteManifest {
    sdkwork_routes_assets_app_api::gateway_route_manifest()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn app_api_manifest_matches_authored_openapi_inventory() {
        let manifest = build_route_manifest();
        let documents = openapi_documents().expect("authored OpenAPI documents parse");
        let manifest_inventory = manifest
            .routes()
            .iter()
            .map(|route| {
                (
                    method_name(route.method),
                    route.path,
                    route.operation_id,
                )
            })
            .collect::<std::collections::BTreeSet<_>>();
        let openapi_inventory = documents
            .iter()
            .flat_map(|document| {
                document["paths"]
                    .as_object()
                    .into_iter()
                    .flat_map(|paths| paths.iter())
                    .flat_map(|(path, item)| {
                        item.as_object().into_iter().flat_map(move |operations| {
                            operations.iter().filter_map(move |(method, operation)| {
                                operation["operationId"].as_str().map(|operation_id| {
                                    (method.as_str(), path.as_str(), operation_id)
                                })
                            })
                        })
                    })
            })
            .collect::<std::collections::BTreeSet<_>>();
        let missing = openapi_inventory
            .difference(&manifest_inventory)
            .cloned()
            .collect::<Vec<_>>();
        let extra = manifest_inventory
            .difference(&openapi_inventory)
            .cloned()
            .collect::<Vec<_>>();
        assert!(
            missing.is_empty() && extra.is_empty(),
            "assets API inventory drift; missing={missing:?}; extra={extra:?}"
        );
    }

    fn method_name(method: sdkwork_web_core::HttpMethod) -> &'static str {
        match method {
            sdkwork_web_core::HttpMethod::Delete => "delete",
            sdkwork_web_core::HttpMethod::Get => "get",
            sdkwork_web_core::HttpMethod::Patch => "patch",
            sdkwork_web_core::HttpMethod::Post => "post",
            sdkwork_web_core::HttpMethod::Put => "put",
        }
    }
}
