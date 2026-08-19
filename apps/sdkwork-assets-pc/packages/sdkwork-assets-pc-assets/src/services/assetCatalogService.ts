import { isBlank } from '@sdkwork/utils';
import type {
  AssetItem,
  AssetListData,
  AssetsAppClient,
  DriveAppClient,
  DriveUploaderProgress,
} from '@sdkwork/assets-pc-core';
import { mapProblemDetailToMessage } from '@sdkwork/assets-pc-commons';

export type { AssetItem };

export interface AssetCatalogClients {
  assets: AssetsAppClient;
  drive: DriveAppClient;
}

export interface ListAssetsQuery {
  cursor?: string;
  pageSize?: number;
  kind?: AssetItem['assetKind'];
  sourceType?: AssetItem['sourceType'];
  q?: string;
}

export interface UploadAssetInput {
  file: File;
  scene?: string;
  source?: string;
  onProgress?: (progress: DriveUploaderProgress) => void;
}

export class AssetCatalogService {
  constructor(private readonly clients: AssetCatalogClients) {}

  async listAssets(query: ListAssetsQuery = {}): Promise<AssetListData> {
    try {
      return await this.clients.assets.assets.list({
        cursor: query.cursor,
        pageSize: query.pageSize ?? 24,
        kind: query.kind,
        sourceType: query.sourceType,
        q: isBlank(query.q) ? undefined : query.q,
      });
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to list assets'));
    }
  }

  async getAsset(assetId: string): Promise<AssetItem> {
    try {
      return await this.clients.assets.assets.retrieve(assetId);
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to load asset'));
    }
  }

  async archiveAsset(assetId: string): Promise<AssetItem> {
    try {
      return await this.clients.assets.assets.archive(assetId, { reason: 'user_archive' });
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to archive asset'));
    }
  }

  async restoreAsset(assetId: string): Promise<AssetItem> {
    try {
      return await this.clients.assets.assets.restore(assetId, { reason: 'user_restore' });
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to restore asset'));
    }
  }

  async uploadAsset(input: UploadAssetInput): Promise<AssetItem> {
    try {
      const uploadResult = await this.clients.drive.uploader.uploadAttachment({
        file: input.file,
        appResourceType: 'app_upload',
        appResourceId: 'sdkwork-assets',
        scene: input.scene ?? 'app_upload',
        source: input.source ?? 'sdkwork-assets',
        onProgress: input.onProgress,
      });

      const nodeId = uploadResult.uploadItem.nodeId || uploadResult.uploadSession.nodeId;
      if (!nodeId) {
        throw new Error('Drive uploader did not return a node identifier');
      }

      return this.getAsset(nodeId);
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to upload asset'));
    }
  }
}

export function createAssetCatalogService(clients: AssetCatalogClients): AssetCatalogService {
  return new AssetCatalogService(clients);
}
