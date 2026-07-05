import type { SdkworkDriveAppClient } from '@sdkwork/drive-app-sdk';

let cachedDriveClient: SdkworkDriveAppClient | null = null;

export function getCachedDriveAppClient(): SdkworkDriveAppClient | null {
  return cachedDriveClient;
}

export function setCachedDriveAppClient(client: SdkworkDriveAppClient | null): void {
  cachedDriveClient = client;
}

export function resetDriveAppClient(): void {
  cachedDriveClient = null;
}
