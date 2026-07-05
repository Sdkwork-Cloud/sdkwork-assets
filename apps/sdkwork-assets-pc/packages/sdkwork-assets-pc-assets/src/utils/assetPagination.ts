import type { AssetPage } from '@sdkwork/drive-app-sdk';

/** Drive `assets.list` cursor pagination — `AssetPage.nextCursor` only (no pageInfo). */
export function getNextAssetsCursor(lastPage: AssetPage): string | undefined {
  return lastPage.nextCursor ?? undefined;
}
