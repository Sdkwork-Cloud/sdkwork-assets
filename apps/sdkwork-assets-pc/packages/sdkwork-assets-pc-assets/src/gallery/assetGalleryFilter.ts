import type { AssetGalleryItem, AssetGallerySort, AssetGallerySource, AssetGalleryType } from './types';

export interface AssetGalleryFilterInput {
  assets: readonly AssetGalleryItem[];
  activeTab: AssetGallerySource;
  filterType: AssetGalleryType | 'all';
  searchQuery: string;
  sortBy: AssetGallerySort;
  resolveTypeLabel?: (type: AssetGalleryType) => string;
}

export function filterAssetGalleryItems(input: AssetGalleryFilterInput): AssetGalleryItem[] {
  const query = input.searchQuery.toLowerCase().trim();

  const filtered = input.assets.filter((asset) => {
    if (input.activeTab === 'created' && asset.source !== 'created') {
      return false;
    }
    if (input.activeTab === 'uploaded' && asset.source !== 'uploaded') {
      return false;
    }
    if (input.activeTab === 'favorite' && asset.source !== 'favorite') {
      return false;
    }
    if (input.filterType !== 'all' && asset.type !== input.filterType) {
      return false;
    }
    if (query) {
      const titleMatch = asset.title?.toLowerCase().includes(query);
      const typeLabel = input.resolveTypeLabel?.(asset.type)?.toLowerCase() ?? asset.type;
      const typeMatch = typeLabel.includes(query);
      if (!titleMatch && !typeMatch) {
        return false;
      }
    }
    return true;
  });

  return sortAssetGalleryItems(filtered, input.sortBy);
}

export function sortAssetGalleryItems(
  assets: readonly AssetGalleryItem[],
  sortBy: AssetGallerySort,
): AssetGalleryItem[] {
  return [...assets].sort((left, right) => {
    if (sortBy === 'date') {
      return right.createdAt.getTime() - left.createdAt.getTime() || left.id.localeCompare(right.id);
    }
    if (sortBy === 'name') {
      return (left.title || left.id).localeCompare(right.title || right.id)
        || left.createdAt.getTime() - right.createdAt.getTime();
    }
    return 0;
  });
}

export function readAssetGalleryCopyText(assets: readonly AssetGalleryItem[]): string {
  return assets
    .map((asset) => asset.assetUrl || asset.thumbnailUrl || asset.title || asset.id)
    .filter(Boolean)
    .join('\n');
}
