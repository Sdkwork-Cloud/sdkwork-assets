import { isBlank } from '@sdkwork/utils';
import type { AssetItem } from '@sdkwork/drive-app-sdk';
import type { ListAssetsQuery } from '../services/assetCatalogService';

export type AssetKindFilter = AssetItem['assetKind'] | '';
export type AssetSourceTypeFilter = AssetItem['sourceType'] | '';

export const ASSET_KIND_FILTER_VALUES: readonly AssetItem['assetKind'][] = [
  'file',
  'image',
  'video',
  'audio',
  'document',
  'model',
  'other',
];

export const ASSET_SOURCE_TYPE_FILTER_VALUES: readonly NonNullable<AssetItem['sourceType']>[] = [
  'upload',
  'ai_generated',
  'imported',
  'edited',
  'system',
];

export interface AssetListFilterInput {
  search: string;
  kind?: AssetKindFilter;
  sourceType?: AssetSourceTypeFilter;
  cursor?: string;
  pageSize?: number;
}

export function buildListAssetsQuery(input: AssetListFilterInput): ListAssetsQuery {
  const query: ListAssetsQuery = {
    cursor: input.cursor,
    pageSize: input.pageSize,
    q: isBlank(input.search) ? undefined : input.search,
    kind: isBlank(input.kind) ? undefined : input.kind as AssetItem['assetKind'],
    sourceType: isBlank(input.sourceType) ? undefined : input.sourceType as AssetItem['sourceType'],
  };
  return query;
}
