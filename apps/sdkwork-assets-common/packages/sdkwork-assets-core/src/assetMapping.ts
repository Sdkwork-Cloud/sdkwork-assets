import { isBlank } from '@sdkwork/utils';

import type { AssetCatalogRef, AssetSourceType } from './artifactBatch.js';
import type { MediaKind, MediaResource } from './mediaResource.js';
import { normalizeMediaResourceSnapshot, readMediaResourceUrl } from './mediaResource.js';

/** Drive global asset catalog kind — authority: drive-app-api AssetItem.assetKind. */
export type DriveAssetKind =
  | 'audio'
  | 'document'
  | 'file'
  | 'image'
  | 'model'
  | 'other'
  | 'video';

/** Drive global asset source — authority: drive-app-api AssetItem.sourceType. */
export type DriveAssetSourceType =
  | 'ai_generated'
  | 'edited'
  | 'imported'
  | 'system'
  | 'upload';

/** Minimal Drive catalog item shape for mapping without importing drive-app-sdk. */
export interface DriveAssetItemLike {
  assetId: string;
  driveSpaceId: string;
  driveNodeId: string;
  driveUri: string;
  assetKind: DriveAssetKind;
  sourceType?: DriveAssetSourceType;
  lifecycleStatus?: string;
  title?: string;
  resourceSnapshot?: unknown;
}

/** PC gallery view taxonomy — UI-only, not a platform catalog enum. */
export type AssetGalleryType = 'image' | 'music' | 'sound' | 'speech' | 'video';

const MEDIA_KIND_TO_ASSET_KIND: Record<MediaKind, DriveAssetKind> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  voice: 'audio',
  document: 'document',
  model: 'model',
  archive: 'file',
  other: 'other',
};

const ASSET_KIND_TO_MEDIA_KIND: Record<DriveAssetKind, MediaKind> = {
  image: 'image',
  video: 'video',
  audio: 'audio',
  document: 'document',
  model: 'model',
  file: 'archive',
  other: 'other',
};

const SOURCE_TYPE_TO_CATALOG: Record<DriveAssetSourceType, AssetSourceType> = {
  upload: 'upload',
  ai_generated: 'ai_generated',
  imported: 'imported',
  edited: 'edited',
  system: 'system',
};

export function mediaKindToAssetKind(kind: MediaKind): DriveAssetKind {
  return MEDIA_KIND_TO_ASSET_KIND[kind] ?? 'other';
}

export function assetKindToMediaKind(kind: DriveAssetKind): MediaKind {
  return ASSET_KIND_TO_MEDIA_KIND[kind] ?? 'other';
}

export function driveSourceTypeToCatalogSourceType(
  sourceType: DriveAssetSourceType | undefined,
): AssetSourceType {
  if (!sourceType) {
    return 'upload';
  }
  return SOURCE_TYPE_TO_CATALOG[sourceType] ?? 'upload';
}

export function assetItemToMediaResource(item: DriveAssetItemLike): MediaResource | undefined {
  const snapshot = normalizeMediaResourceSnapshot(item.resourceSnapshot);
  if (snapshot) {
    return snapshot;
  }
  if (isBlank(item.driveUri)) {
    return undefined;
  }
  return {
    id: item.driveNodeId,
    kind: assetKindToMediaKind(item.assetKind),
    source: 'drive',
    uri: item.driveUri,
    title: item.title,
  };
}

export function assetItemToCatalogRef(item: DriveAssetItemLike): AssetCatalogRef {
  return {
    assetId: item.assetId,
    driveSpaceId: item.driveSpaceId,
    driveNodeId: item.driveNodeId,
    driveUri: item.driveUri,
    sourceType: driveSourceTypeToCatalogSourceType(item.sourceType),
    lifecycleState: item.lifecycleStatus === 'archived' ? 'archived' : 'active',
  };
}

export function galleryTypeFromMediaKind(
  kind: MediaKind,
  modality?: string,
): AssetGalleryType {
  if (kind === 'image') {
    return 'image';
  }
  if (kind === 'video') {
    return 'video';
  }
  if (kind === 'voice') {
    return 'speech';
  }
  const normalizedModality = modality?.trim().toLowerCase();
  if (normalizedModality === 'music') {
    return 'music';
  }
  if (normalizedModality === 'sfx') {
    return 'sound';
  }
  if (kind === 'audio') {
    return normalizedModality === 'audio' ? 'speech' : 'music';
  }
  return 'image';
}

export function readAssetItemDeliveryUrl(item: DriveAssetItemLike): string {
  const resource = assetItemToMediaResource(item);
  return readMediaResourceUrl(resource);
}
