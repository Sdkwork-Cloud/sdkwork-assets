import type { AssetListData } from '@sdkwork/assets-pc-core';

/** Drive `assets.list` cursor pagination — `AssetPage.nextCursor` only (no pageInfo). */
export function getNextAssetsCursor(lastPage: AssetListData): string | undefined {
  return lastPage.pageInfo?.nextCursor ?? undefined;
}
