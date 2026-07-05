import { isBlank, trim } from '@sdkwork/utils';

export type MediaKind =
  | 'archive'
  | 'audio'
  | 'document'
  | 'image'
  | 'model'
  | 'other'
  | 'video'
  | 'voice';

export type MediaSource =
  | 'data_url'
  | 'drive'
  | 'external_url'
  | 'generated'
  | 'provider_asset';

export type MediaAiProvenanceKind = 'edited' | 'generated' | 'imported' | 'uploaded';

export type MediaModerationStatus =
  | 'approved'
  | 'blocked'
  | 'pending'
  | 'rejected'
  | 'unknown';

export type MediaAccessVisibility =
  | 'organization'
  | 'private'
  | 'public'
  | 'signed'
  | 'tenant';

export interface MediaChecksum {
  algorithm: string;
  value: string;
}

export interface MediaAccess {
  visibility: MediaAccessVisibility;
  expiresAt?: string;
}

export interface MediaAiProvenance {
  provenance?: MediaAiProvenanceKind;
  provider?: string;
  model?: string;
  promptId?: string;
  generationTaskId?: string;
  sourceMediaIds?: string[];
  seed?: string;
  moderationStatus?: MediaModerationStatus;
  safetyLabels?: string[];
}

/** Canonical business-state media per MEDIA_RESOURCE_SPEC §3. */
export interface MediaResource {
  id?: string;
  kind: MediaKind;
  source: MediaSource;
  url?: string;
  publicUrl?: string;
  uri?: string;
  objectBlobId?: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: string;
  checksum?: MediaChecksum;
  width?: number;
  height?: number;
  durationSeconds?: number;
  altText?: string;
  title?: string;
  poster?: MediaResource;
  thumbnails?: MediaResource[];
  variants?: MediaResource[];
  access?: MediaAccess;
  ai?: MediaAiProvenance;
  metadata?: Record<string, unknown>;
}

/** Backward-compatible alias used by PC commons consumers. */
export type MediaResourceLike = MediaResource;

export function readMediaResourceUrl(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return '';
  }
  const record = value as Record<string, unknown>;
  for (const key of ['publicUrl', 'url', 'uri', 'objectBlobId', 'id']) {
    const raw = record[key];
    if (typeof raw === 'string') {
      const normalized = trim(raw);
      if (!isBlank(normalized)) {
        return normalized;
      }
    }
  }
  return '';
}

export function readMediaResourceThumb(media: MediaResource | undefined): string {
  return readMediaResourceUrl(media?.poster)
    || readMediaResourceUrl(media?.thumbnails?.[0])
    || readMediaResourceUrl(media);
}

export function toExternalUrlMediaResource(
  value: string | null | undefined,
  kind: MediaKind = 'image',
): MediaResource | undefined {
  const url = typeof value === 'string' ? trim(value) : '';
  if (isBlank(url)) {
    return undefined;
  }
  return {
    kind,
    source: url.startsWith('data:') ? 'data_url' : 'external_url',
    url,
    publicUrl: url,
  };
}

export function assertMediaResource(value: MediaResource): void {
  if (isBlank(value.kind)) {
    throw new Error('MediaResource.kind is required');
  }
  if (isBlank(value.source)) {
    throw new Error('MediaResource.source is required');
  }
}

export function normalizeMediaResourceSnapshot(value: unknown): MediaResource | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const kind = record.kind;
  const source = record.source;
  if (typeof kind !== 'string' || isBlank(kind) || typeof source !== 'string' || isBlank(source)) {
    return undefined;
  }
  return record as MediaResource;
}
