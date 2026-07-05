export type {
  MediaChecksum,
  MediaKind,
  MediaResource,
  MediaResourceLike,
  MediaSource,
} from '@sdkwork/assets-core';

export {
  assertMediaResource,
  readMediaResourceThumb,
  readMediaResourceUrl,
  toExternalUrlMediaResource,
} from '@sdkwork/assets-core';

export async function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  throw new Error('Clipboard API is unavailable');
}
