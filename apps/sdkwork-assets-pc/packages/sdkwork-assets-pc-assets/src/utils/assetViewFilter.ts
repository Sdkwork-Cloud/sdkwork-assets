import type { AssetItem } from '@sdkwork/drive-app-sdk';

export type AssetViewFilter = 'active' | 'archived' | 'all';

export function matchesAssetViewFilter(asset: AssetItem, filter: AssetViewFilter): boolean {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'archived') {
    return asset.lifecycleStatus === 'archived';
  }
  return asset.lifecycleStatus === 'active';
}
