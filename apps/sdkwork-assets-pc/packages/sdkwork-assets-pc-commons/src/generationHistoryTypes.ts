import type { MediaResourceLike } from './mediaResource';

export type AssetGenerationHistoryType =
  | 'text'
  | 'image'
  | 'images'
  | 'video'
  | 'music'
  | 'audio'
  | 'sfx';

export type AssetGenerationMedia = MediaResourceLike & {
  durationSeconds?: number;
  height?: number;
  poster?: AssetGenerationMedia;
  thumbnails?: AssetGenerationMedia[];
  width?: number;
};

export interface AssetGenerationHistoryItem {
  activeIndex?: number;
  aspectRatio?: string;
  createdAt?: string;
  date: string;
  durationSeconds?: number;
  generationConfig?: Record<string, unknown>;
  id: string;
  asset?: AssetGenerationMedia;
  images?: AssetGenerationMedia[];
  videos?: AssetGenerationMedia[];
  modelCatalogKey?: string;
  modelInfo?: string;
  outputText?: string;
  prompt: string;
  status?: string;
  type: AssetGenerationHistoryType;
  updatedAt?: string;
}

export function normalizeAssetGenerationHistoryType(
  value: unknown,
): AssetGenerationHistoryType {
  switch (value) {
    case 'text':
      return 'text';
    case 'image':
    case 'images':
      return 'images';
    case 'video':
      return 'video';
    case 'music':
      return 'music';
    case 'audio':
      return 'audio';
    case 'sfx':
      return 'sfx';
    default:
      throw new Error('Generation history type is required');
  }
}

export function isAssetGenerationImageHistoryType(
  historyType: AssetGenerationHistoryType,
): boolean {
  const normalized = normalizeAssetGenerationHistoryType(historyType);
  return normalized === 'image' || normalized === 'images';
}
