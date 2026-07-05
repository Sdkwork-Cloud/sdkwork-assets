import { useMemo } from 'react';
import type { SdkworkDriveAppClient } from '@sdkwork/drive-app-sdk';

import {
  getCachedDriveAppClient,
  resetDriveAppClient,
  setCachedDriveAppClient,
} from './driveClientCache';
import { getAssetsIamBundle } from '../iam/assetsIamRuntime';

export type DriveAppClient = SdkworkDriveAppClient;

export { resetDriveAppClient };

export function getDriveAppClient(): SdkworkDriveAppClient {
  const cached = getCachedDriveAppClient();
  if (cached) {
    return cached;
  }
  const client = getAssetsIamBundle().createDriveClient();
  setCachedDriveAppClient(client);
  return client;
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
