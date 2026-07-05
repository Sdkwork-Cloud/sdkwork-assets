import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type { AssetItem, AssetPage } from '@sdkwork/drive-app-sdk';

type AssetsInfiniteData = InfiniteData<AssetPage, string | undefined>;

function patchAssetLifecycleInPages(
  pages: AssetPage[],
  assetId: string,
  lifecycleStatus: AssetItem['lifecycleStatus'],
): AssetPage[] {
  return pages.map((page) => ({
    ...page,
    items: page.items.map((item) =>
      item.assetId === assetId ? { ...item, lifecycleStatus } : item,
    ),
  }));
}

/** Drive list omits archived flag; patch local cache after archive/restore for consistent UI. */
export function patchAssetLifecycleInCache(
  queryClient: QueryClient,
  assetId: string,
  lifecycleStatus: AssetItem['lifecycleStatus'],
): void {
  queryClient.setQueriesData<AssetsInfiniteData>(
    { queryKey: ['assets'] },
    (current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        pages: patchAssetLifecycleInPages(current.pages, assetId, lifecycleStatus),
      };
    },
  );
}
