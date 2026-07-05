import { describe, expect, it } from 'vitest';
import type { AssetItem } from '@sdkwork/drive-app-sdk';
import { matchesAssetViewFilter } from './assetViewFilter';

function assetWithLifecycle(lifecycleStatus: AssetItem['lifecycleStatus']): AssetItem {
  return {
    assetId: 'a1',
    title: 'Test',
    lifecycleStatus,
    driveSpaceId: 'space',
    driveNodeId: 'node',
    nodeType: 'file',
    assetKind: 'image',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

describe('matchesAssetViewFilter', () => {
  it('includes all items when filter is all', () => {
    expect(matchesAssetViewFilter(assetWithLifecycle('archived'), 'all')).toBe(true);
  });

  it('filters active and archived views', () => {
    expect(matchesAssetViewFilter(assetWithLifecycle('active'), 'active')).toBe(true);
    expect(matchesAssetViewFilter(assetWithLifecycle('archived'), 'active')).toBe(false);
    expect(matchesAssetViewFilter(assetWithLifecycle('archived'), 'archived')).toBe(true);
  });
});
