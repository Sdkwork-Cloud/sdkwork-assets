import type { AssetCatalogRef, ImportedMediaArtifact, MediaArtifactBatch } from './artifactBatch.js';
import type { MediaKind, MediaResource, MediaSource } from './mediaResource.js';
import { assertMediaResource } from './mediaResource.js';
import {
  buildAiGeneratedNodeId,
  buildAiGeneratedSpaceId,
  buildDriveUri,
  buildUploadTaskId,
  uploadProfileForMediaKind,
} from './driveLayout.js';

export type DriveSpaceProfile = 'ai_generated';

export interface DriveIngestContext {
  tenantId: string;
  ownerSubjectType: string;
  ownerSubjectId: string;
  actorType: string;
  actorId: string;
  spaceProfile: DriveSpaceProfile;
}

export interface DriveImportItemPlan {
  outputIndex: number;
  scene: string;
  driveSpaceId: string;
  driveNodeId: string;
  driveUri: string;
  uploadProfileCode: string;
  uploadTaskId: string;
  providerAssetId?: string;
  providerUri?: string;
  providerUrl?: string;
  mediaResource: MediaResource;
}

export interface DriveImportPlan {
  generationId: string;
  providerCode: string;
  items: DriveImportItemPlan[];
}

export interface AssetPromoteOptions {
  title?: string;
  tags?: string[];
  collectionId?: string;
}

export interface AssetPromoteRequest {
  tenantId: string;
  imported: ImportedMediaArtifact;
  options: AssetPromoteOptions;
}

export function buildDriveImportPlan(
  batch: MediaArtifactBatch,
  context: DriveIngestContext,
): DriveImportPlan {
  if (!context.tenantId.trim()) {
    throw new Error('DriveIngestContext.tenantId is required');
  }
  if (!context.ownerSubjectId.trim()) {
    throw new Error('DriveIngestContext.ownerSubjectId is required');
  }
  if (!batch.provenance.generationId.trim()) {
    throw new Error('GenerationProvenance.generationId is required');
  }

  const providerCode = batch.provenance.provider?.providerCode ?? 'unknown';
  const driveSpaceId = buildAiGeneratedSpaceId(
    context.ownerSubjectType,
    context.ownerSubjectId,
  );
  const modality = batch.provenance.modality.trim();

  return {
    generationId: batch.provenance.generationId,
    providerCode,
    items: batch.artifacts.map((artifact) => buildItemPlan(
      artifact,
      batch.provenance.generationId,
      modality,
      batch.provenance.scene,
      driveSpaceId,
    )),
  };
}

function buildItemPlan(
  artifact: MediaArtifactBatch['artifacts'][number],
  generationId: string,
  modality: string,
  scene: string,
  driveSpaceId: string,
): DriveImportItemPlan {
  const driveNodeId = buildAiGeneratedNodeId(generationId, artifact.index);
  const driveUri = buildDriveUri(driveSpaceId, driveNodeId);
  const mediaResource: MediaResource = {
    id: driveNodeId,
    kind: artifact.kind,
    source: 'drive',
    uri: driveUri,
    fileName: artifact.fileName,
    mimeType: artifact.mimeType,
    sizeBytes: artifact.sizeBytes?.toString(),
    width: artifact.width,
    height: artifact.height,
    durationSeconds: artifact.durationSeconds,
    ai: {
      provenance: 'generated',
      generationTaskId: generationId,
    },
  };
  assertMediaResource(mediaResource);

  return {
    outputIndex: artifact.index,
    scene,
    driveSpaceId,
    driveNodeId,
    driveUri,
    uploadProfileCode: uploadProfileForMediaKind(artifact.kind),
    uploadTaskId: buildUploadTaskId(modality, generationId, artifact.index),
    providerAssetId: artifact.providerAssetId,
    providerUri: artifact.providerUri,
    providerUrl: artifact.providerUrl,
    mediaResource,
  };
}

export function buildAiGeneratedCatalogRef(imported: ImportedMediaArtifact): AssetCatalogRef {
  return {
    assetId: imported.driveNodeId,
    driveSpaceId: imported.driveSpaceId,
    driveNodeId: imported.driveNodeId,
    driveUri: imported.driveUri,
    sourceType: 'ai_generated',
    lifecycleState: 'active',
  };
}

export const CLAWROUTER_OPEN_SDK_INTEGRATION = {
  rustCrate: 'clawrouter_open_sdk',
  modalities: ['image', 'video', 'music', 'audio'] as const,
} as const;

export type ClawRouterModality = typeof CLAWROUTER_OPEN_SDK_INTEGRATION.modalities[number];

export function resolveMediaKindFromModality(modality: string): MediaKind {
  switch (modality.trim().toLowerCase()) {
    case 'image':
    case 'images':
      return 'image';
    case 'video':
    case 'videos':
      return 'video';
    case 'music':
      return 'audio';
    case 'audio':
    case 'audios':
      return 'audio';
    case 'sfx':
      return 'audio';
    case 'model':
    case 'models':
      return 'model';
    default:
      return 'other';
  }
}

export function resolveMediaSourceFromProviderArtifact(
  hasProviderLocation: boolean,
): MediaSource {
  return hasProviderLocation ? 'provider_asset' : 'generated';
}
