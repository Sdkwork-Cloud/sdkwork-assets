import { isBlank } from '@sdkwork/utils';

import type { MediaKind, MediaResource } from './mediaResource.js';

export type AssetSourceType = 'ai_generated' | 'edited' | 'imported' | 'system' | 'upload';
export type AssetLifecycleState = 'active' | 'archived';

export interface ProviderRef {
  providerCode: string;
  providerAssetId?: string;
  providerUri?: string;
  providerUrl?: string;
}

export interface GenerationProvenance {
  modality: string;
  operationType: string;
  generationId: string;
  scene: string;
  provider?: ProviderRef;
  model?: string;
}

export interface MediaArtifact {
  index: number;
  kind: MediaKind;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  providerAssetId?: string;
  providerUri?: string;
  providerUrl?: string;
}

export interface MediaArtifactBatch {
  batchId: string;
  provenance: GenerationProvenance;
  artifacts: MediaArtifact[];
}

export interface AssetCatalogRef {
  assetId: string;
  driveSpaceId: string;
  driveNodeId: string;
  driveUri: string;
  sourceType: AssetSourceType;
  lifecycleState: AssetLifecycleState;
}

export interface ImportedMediaArtifact {
  index: number;
  driveSpaceId: string;
  driveNodeId: string;
  driveUri: string;
  mediaResource: MediaResource;
  assetCatalog?: AssetCatalogRef;
}

export function validateMediaArtifactBatch(batch: MediaArtifactBatch): void {
  if (isBlank(batch.batchId)) {
    throw new Error('MediaArtifactBatch.batchId is required');
  }
  if (batch.artifacts.length === 0) {
    throw new Error('MediaArtifactBatch.artifacts must not be empty');
  }
  const seen = new Set<number>();
  for (const artifact of batch.artifacts) {
    if (artifact.index < 0) {
      throw new Error('MediaArtifact.index must be non-negative');
    }
    if (seen.has(artifact.index)) {
      throw new Error('MediaArtifact.index must be unique within batch');
    }
    seen.add(artifact.index);
  }
}
