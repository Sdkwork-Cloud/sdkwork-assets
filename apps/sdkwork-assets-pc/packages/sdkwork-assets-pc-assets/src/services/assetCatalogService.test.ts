import { describe, expect, it, vi } from 'vitest';
import { createAssetCatalogService } from './assetCatalogService';
import type { DriveAppClient } from '@sdkwork/assets-pc-core';

function createMockClient(): DriveAppClient {
  return {
    assets: {
      list: vi.fn(async () => ({
        items: [{ assetId: 'a1', title: 'Test', driveNodeId: 'a1', driveSpaceId: 's1', nodeType: 'file', assetKind: 'image', lifecycleStatus: 'active', createdAt: '', updatedAt: '' }],
        nextCursor: undefined,
      })),
      get: vi.fn(),
      archive: vi.fn(),
      restore: vi.fn(),
    },
    uploader: {
      upload: vi.fn(),
    },
  } as unknown as DriveAppClient;
}

describe('assetCatalogService', () => {
  it('lists assets through drive sdk', async () => {
    const client = createMockClient();
    const service = createAssetCatalogService(client);
    const page = await service.listAssets({ q: 'logo' });
    expect(page.items).toHaveLength(1);
    expect(client.assets.list).toHaveBeenCalled();
  });
});
