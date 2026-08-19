// Generated metadata for sdkwork-assets-app-sdk composed facade consumers.
// Keep outside generated/server-openapi so SDK ownership metadata does not pollute sdkgen output.

export const sdkMetadata = {
  name: "sdkwork-assets-app-sdk",
  packageName: "sdkwork-assets-app-sdk-generated-typescript",
  sdkOwner: "sdkwork-assets",
  apiAuthority: "sdkwork-assets-app-api",
  language: "typescript",
  standardProfile: "sdkwork-v3",
  baseUrl: "http://127.0.0.1:18080",
  apiPrefix: "/app/v3/api",
  sdkDependencies: [
    {
      workspace: "sdkwork-iam-app-sdk",
      role: "appbase-app-capability",
      required: true,
      dependencyMode: "consumer-sdk",
      apiPrefix: "/app/v3/api",
      apiAuthority: "sdkwork-iam-app-api",
      generatedTransportImportPolicy: "forbidden",
      packageByLanguage: {
        typescript: "@sdkwork/iam-app-sdk",
      },
    },
  ],
};

export const operations = {
  "assets.list": { method: "GET", path: "/app/v3/api/assets" },
  "assets.create": { method: "POST", path: "/app/v3/api/assets" },
  "assets.retrieve": { method: "GET", path: "/app/v3/api/assets/{assetId}" },
  "assets.update": { method: "PATCH", path: "/app/v3/api/assets/{assetId}" },
  "assets.archive": { method: "POST", path: "/app/v3/api/assets/{assetId}/archive" },
  "assets.restore": { method: "POST", path: "/app/v3/api/assets/{assetId}/restore" },
  "assetCollections.list": { method: "GET", path: "/app/v3/api/assets/collections" },
  "assetCollections.create": { method: "POST", path: "/app/v3/api/assets/collections" },
  "assetCollectionItems.create": {
    method: "POST",
    path: "/app/v3/api/assets/collections/{collectionId}/items",
  },
  "assetCollectionItems.delete": {
    method: "DELETE",
    path: "/app/v3/api/assets/collections/{collectionId}/items/{itemId}",
  },
  "assetRelations.create": {
    method: "POST",
    path: "/app/v3/api/assets/{assetId}/relations",
  },
  "assetRelations.delete": {
    method: "DELETE",
    path: "/app/v3/api/assets/{assetId}/relations/{relationId}",
  },
} as const;
