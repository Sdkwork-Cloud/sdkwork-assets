import { isBlank } from '@sdkwork/utils';
import type { AssetItem, AssetPage, DriveUploaderProgress } from '@sdkwork/drive-app-sdk';
import type { DriveAppClient } from '@sdkwork/assets-pc-core';
import { mapProblemDetailToMessage } from '@sdkwork/assets-pc-commons';

export type { AssetItem };

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
  constructor(private readonly client: DriveAppClient) {}

  async listAssets(query: ListAssetsQuery = {}): Promise<AssetPage> {
    try {
      return await this.client.assets.list({
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
      return await this.client.assets.get(assetId);
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to load asset'));
    }
  }

  async archiveAsset(assetId: string): Promise<AssetItem> {
    try {
      return await this.client.assets.archive(assetId, { reason: 'user_archive' });
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to archive asset'));
    }
  }

  async restoreAsset(assetId: string): Promise<AssetItem> {
    try {
      return await this.client.assets.restore(assetId, { reason: 'user_restore' });
    } catch (error) {
      throw new Error(mapProblemDetailToMessage(error, 'Failed to restore asset'));
    }
  }

  async uploadAsset(input: UploadAssetInput): Promise<AssetItem> {
    try {
      const uploadResult = await this.client.uploader.uploadAttachment({
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

export function createAssetCatalogService(client: DriveAppClient): AssetCatalogService {
  return new AssetCatalogService(client);
}
