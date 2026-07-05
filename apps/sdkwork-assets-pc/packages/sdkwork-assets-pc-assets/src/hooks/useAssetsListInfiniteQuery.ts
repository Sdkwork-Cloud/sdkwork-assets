import { useDeferredValue, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { AssetItem, AssetPage } from '@sdkwork/drive-app-sdk';
import { useDriveAppClient } from '@sdkwork/assets-pc-core';
import { createAssetCatalogService } from '../services/assetCatalogService';
import { getNextAssetsCursor } from '../utils/assetPagination';
import {
  type AssetKindFilter,
  type AssetSourceTypeFilter,
  buildListAssetsQuery,
} from '../utils/assetListFilters';
import { type AssetViewFilter, matchesAssetViewFilter } from '../utils/assetViewFilter';

export type { AssetViewFilter, AssetKindFilter, AssetSourceTypeFilter };
export { matchesAssetViewFilter };

export interface UseAssetsListInfiniteQueryOptions {
  queryScope: 'list' | 'picker';
  search: string;
  kind?: AssetKindFilter;
  sourceType?: AssetSourceTypeFilter;
  pageSize?: number;
  enabled?: boolean;
}

export function useAssetsListInfiniteQuery({
  queryScope,
  search,
  kind = '',
  sourceType = '',
  pageSize,
  enabled = true,
}: UseAssetsListInfiniteQueryOptions) {
  const deferredSearch = useDeferredValue(search);
  const deferredKind = useDeferredValue(kind);
  const deferredSourceType = useDeferredValue(sourceType);
  const client = useDriveAppClient();
  const service = useMemo(() => createAssetCatalogService(client), [client]);

  return useInfiniteQuery({
    queryKey: ['assets', queryScope, deferredSearch, deferredKind, deferredSourceType],
    queryFn: ({ pageParam }) =>
      service.listAssets(
        buildListAssetsQuery({
          search: deferredSearch,
          kind: deferredKind,
          sourceType: deferredSourceType,
          cursor: pageParam,
          pageSize,
        }),
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: getNextAssetsCursor,
    enabled,
  });
}

export function flattenAssetPages(pages: AssetPage[] | undefined): AssetItem[] {
  return pages?.flatMap((page) => page.items) ?? [];
}
