import { readMediaResourceUrl } from '@sdkwork/assets-pc-commons';
import {
  isSdkworkGenerationImageHistoryType,
  readSdkworkGenerationMediaThumb,
  readSdkworkGenerationMediaUrl,
  type SdkworkGenerationHistoryItem,
  type SdkworkGenerationHistoryType,
} from '@sdkwork/generations-pc-workspace/generation-history';
import type { AssetGalleryItem, AssetGalleryType } from './types';
import { galleryTypeFromMediaKind } from '@sdkwork/assets-core';

export function mapGenerationHistoryToGalleryItems(
  items: readonly SdkworkGenerationHistoryItem[],
  options?: { source?: AssetGalleryItem['source'] },
): AssetGalleryItem[] {
  const source = options?.source ?? 'created';

  return items
    .filter((item) => item.type !== 'text')
    .map((item) => {
      const asset = readGenerationHistoryAssetResource(item);
      const thumbnail = readGenerationHistoryThumbnail(item, asset);
      return {
        id: item.id,
        type: mapGenerationHistoryTypeToGalleryType(item.type),
        thumbnailUrl: readMediaResourceUrl(thumbnail) || readSdkworkGenerationMediaThumb(thumbnail),
        assetUrl: readMediaResourceUrl(asset) || readSdkworkGenerationMediaUrl(asset),
        duration: formatGalleryDuration(item.durationSeconds),
        title: createGalleryTitle(item),
        createdAt: readGalleryCreatedAt(item),
        source,
      };
    });
}

function readGenerationHistoryAssetResource(item: SdkworkGenerationHistoryItem) {
  if (isSdkworkGenerationImageHistoryType(item.type)) {
    return item.images?.[0] ?? item.asset;
  }
  if (item.type === 'video') {
    return item.videos?.[0] ?? item.asset;
  }
  return item.asset ?? item.images?.[0] ?? item.videos?.[0];
}

function readGenerationHistoryThumbnail(
  item: SdkworkGenerationHistoryItem,
  fallback: SdkworkGenerationHistoryItem['asset'],
) {
  if (isSdkworkGenerationImageHistoryType(item.type)) {
    return item.images?.[0] ?? fallback;
  }
  if (item.type === 'video') {
    const video = item.videos?.[0] ?? item.asset;
    return video?.poster ?? video?.thumbnails?.[0] ?? fallback;
  }
  return fallback;
}

function readGalleryCreatedAt(item: SdkworkGenerationHistoryItem): Date {
  const date = new Date(item.updatedAt || item.createdAt || `${item.date}T00:00:00Z`);
  return Number.isFinite(date.getTime()) ? date : new Date(0);
}

function createGalleryTitle(item: SdkworkGenerationHistoryItem): string {
  const title = item.prompt.trim();
  if (!title) {
    return item.id;
  }
  return title.length > 50 ? `${title.slice(0, 47).trimEnd()}...` : title;
}

function formatGalleryDuration(durationSeconds: number | undefined): string | undefined {
  if (durationSeconds === undefined) {
    return undefined;
  }
  const roundedSeconds = Math.max(0, Math.round(durationSeconds));
  if (roundedSeconds < 60) {
    return `${roundedSeconds}s`;
  }
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function mapGenerationHistoryTypeToGalleryType(
  type?: SdkworkGenerationHistoryType,
): AssetGalleryType {
  if (type && isSdkworkGenerationImageHistoryType(type)) {
    return 'image';
  }
  switch (type) {
    case 'video':
      return 'video';
    case 'music':
      return 'music';
    case 'audio':
      return galleryTypeFromMediaKind('audio', 'audio');
    case 'sfx':
      return galleryTypeFromMediaKind('audio', 'sfx');
    default:
      return 'sound';
  }
}
