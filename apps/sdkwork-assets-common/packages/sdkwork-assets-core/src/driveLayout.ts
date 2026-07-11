import type { MediaKind } from './mediaResource.js';

export function stableIdentifierSuffix(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 48);
}

export function buildAiGeneratedSpaceId(
  ownerSubjectType: string,
  ownerSubjectId: string,
): string {
  return `space-ai-generated-${stableIdentifierSuffix(ownerSubjectType)}-${stableIdentifierSuffix(ownerSubjectId)}`;
}

export function buildAiGeneratedNodeId(generationId: string, outputIndex: number): string {
  return `node-ai-generated-${stableIdentifierSuffix(generationId)}-${outputIndex}`;
}

export function buildDriveUri(spaceId: string, nodeId: string): string {
  return `drive://spaces/${spaceId}/nodes/${nodeId}`;
}

export function buildUploadTaskId(
  modality: string,
  generationId: string,
  outputIndex: number,
): string {
  return `${stableIdentifierSuffix(modality)}-generation-${stableIdentifierSuffix(generationId)}-${outputIndex}`;
}

export function uploadProfileForMediaKind(kind: MediaKind): string {
  switch (kind) {
    case 'image':
      return 'image';
    case 'video':
      return 'video';
    case 'audio':
    case 'voice':
      return 'audio';
    case 'document':
      return 'document';
    default:
      return 'generic';
  }
}
