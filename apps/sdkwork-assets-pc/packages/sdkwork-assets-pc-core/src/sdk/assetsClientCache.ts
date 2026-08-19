import type { SdkworkAppClient as SdkworkAssetsAppClient } from '@sdkwork/assets-app-sdk';

let cachedAssetsClient: SdkworkAssetsAppClient | null = null;

export function getCachedAssetsAppClient(): SdkworkAssetsAppClient | null {
  return cachedAssetsClient;
}

export function setCachedAssetsAppClient(client: SdkworkAssetsAppClient | null): void {
  cachedAssetsClient = client;
}

export function resetAssetsAppClient(): void {
  cachedAssetsClient = null;
}
