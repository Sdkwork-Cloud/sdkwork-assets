import { useMemo } from 'react';
import type { SdkworkAppClient as SdkworkAssetsAppClient } from '@sdkwork/assets-app-sdk';
import type { SdkworkDriveAppClient } from '@sdkwork/drive-app-sdk';

import {
  getCachedAssetsAppClient,
  resetAssetsAppClient,
  setCachedAssetsAppClient,
} from './assetsClientCache';
import {
  getCachedDriveAppClient,
  resetDriveAppClient,
  setCachedDriveAppClient,
} from './driveClientCache';
import { getAssetsIamBundle } from '../iam/assetsIamRuntime';

export type AssetsAppClient = SdkworkAssetsAppClient;
export type DriveAppClient = SdkworkDriveAppClient;
export type { AssetItem, AssetListData } from '@sdkwork/assets-app-sdk';
export type { DriveUploaderProgress } from '@sdkwork/drive-app-sdk';

export { resetAssetsAppClient, resetDriveAppClient };

export function getAssetsAppClient(): SdkworkAssetsAppClient {
  const cached = getCachedAssetsAppClient();
  if (cached) {
    return cached;
  }
  const client = getAssetsIamBundle().createAssetsClient();
  setCachedAssetsAppClient(client);
  return client;
}

export function getDriveAppClient(): SdkworkDriveAppClient {
  const cached = getCachedDriveAppClient();
  if (cached) {
    return cached;
  }
  const client = getAssetsIamBundle().createDriveClient();
  setCachedDriveAppClient(client);
  return client;
}

export function useAssetsAppClient(): SdkworkAssetsAppClient {
  return useMemo(() => getAssetsAppClient(), []);
}

export function useDriveAppClient(): SdkworkDriveAppClient {
  return useMemo(() => getDriveAppClient(), []);
}

export {
  assetsSessionStore,
  hasAssetsIamSession,
  type AssetsSessionSnapshot,
} from '../session/assetsSessionStore';
export {
  bootstrapAssetsIamSession,
  getAssetsIamBundle,
  getAssetsIamComposition,
  invalidateAssetsIamRuntime,
  type AssetsIamBundle,
  type AssetsIamRuntime,
} from '../iam/assetsIamRuntime';
export {
  getAssetsDeploymentProfile,
  getAssetsEnvironment,
  getPlatformApiGatewayHttpUrl,
} from '../iam/assetsEnvironment';
