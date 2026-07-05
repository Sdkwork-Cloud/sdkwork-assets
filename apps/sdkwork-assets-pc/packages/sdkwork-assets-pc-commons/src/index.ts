import { formatDatetimeLocaleStr, isBlank, trim, type SdkWorkProblemDetail } from '@sdkwork/utils';

export function normalizeString(value: unknown): string {
  if (typeof value === 'string') {
    return trim(value);
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
}

export function formatAssetTimestamp(iso: string, locale = 'en-US'): string {
  return formatDatetimeLocaleStr(iso, locale) ?? iso;
}

export function formatAssetKindLabel(kind: string): string {
  if (isBlank(kind)) {
    return 'Unknown';
  }
  return kind
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function mapProblemDetailToMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const detail = error as Partial<SdkWorkProblemDetail>;
  if (typeof detail.detail === 'string' && !isBlank(detail.detail)) {
    return detail.detail;
  }
  if (typeof detail.title === 'string' && !isBlank(detail.title)) {
    return detail.title;
  }

  return fallback;
}

export { isBlank, trim };
export { readAssetsViteEnv } from './readAssetsViteEnv';
export {
  copyTextToClipboard,
  readMediaResourceThumb,
  readMediaResourceUrl,
  toExternalUrlMediaResource,
  type MediaResourceKind,
  type MediaResourceLike,
} from './mediaResource';
export {
  isAssetGenerationImageHistoryType,
  normalizeAssetGenerationHistoryType,
  type AssetGenerationHistoryItem,
  type AssetGenerationHistoryType,
  type AssetGenerationMedia,
} from './generationHistoryTypes';
