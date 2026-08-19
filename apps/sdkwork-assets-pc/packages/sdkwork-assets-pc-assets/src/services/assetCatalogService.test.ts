import { describe, expect, it, vi } from 'vitest';
import { createAssetCatalogService } from './assetCatalogService';
import type { AssetCatalogClients } from './assetCatalogService';

function createMockClients(): AssetCatalogClients {
  const assetsClient = {
    assets: {
      list: vi.fn(async () => ({
        items: [{ assetId: 'a1', title: 'Test', driveNodeId: 'a1', driveSpaceId: 's1', nodeType: 'file', assetKind: 'image', lifecycleStatus: 'active', createdAt: '', updatedAt: '' }],
        pageInfo: { mode: 'cursor' },
      })),
      retrieve: vi.fn(),
      archive: vi.fn(),
      restore: vi.fn(),
    },
  };
  const driveClient = {
    uploader: {
      uploadAttachment: vi.fn(),
    },
  };
  return {
    assets: assetsClient as unknown as AssetCatalogClients['assets'],
    drive: driveClient as unknown as AssetCatalogClients['drive'],
  };
}

describe('assetCatalogService', () => {
  it('lists assets through assets app sdk', async () => {
    const clients = createMockClients();
    const service = createAssetCatalogService(clients);
    const page = await service.listAssets({ q: 'logo' });
    expect(page.items).toHaveLength(1);
    expect(clients.assets.assets.list).toHaveBeenCalled();
  });
});
