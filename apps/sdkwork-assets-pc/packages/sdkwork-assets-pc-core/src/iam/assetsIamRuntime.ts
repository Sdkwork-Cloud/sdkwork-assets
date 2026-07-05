import { createClient, type SdkworkAppClient } from '@sdkwork/iam-app-sdk';
import {
  createSdkworkAppbasePcAuthRuntime,
  type SdkworkAppbasePcAuthRuntimeComposition,
  type SdkworkAppbasePcAuthSessionBridgeSession,
} from '@sdkwork/auth-runtime-pc-react';
import type { IamDeploymentMode, IamEnvironment } from '@sdkwork/iam-contracts';
import type { AuthTokenManager } from '@sdkwork/sdk-common';
import { createTokenManager } from '@sdkwork/sdk-common';
import { createDriveAppClient, type SdkworkDriveAppClient } from '@sdkwork/drive-app-sdk';

import { resetDriveAppClient } from '../sdk/driveClientCache';
import {
  getAssetsDeploymentProfile,
  getAssetsEnvironment,
  getPlatformApiGatewayHttpUrl,
} from './assetsEnvironment';
import {
  assetsSessionStore,
  type AssetsSessionSnapshot,
} from '../session/assetsSessionStore';

const APP_ID = 'sdkwork-assets';
const APP_API_PREFIX = '/app/v3/api';

export type AssetsIamRuntime = ReturnType<SdkworkAppbasePcAuthRuntimeComposition['getRuntime']>;

export interface AssetsIamBundle {
  tokenManager: AuthTokenManager;
  appbaseApp: SdkworkAppClient;
  runtime: AssetsIamRuntime;
  createDriveClient: () => SdkworkDriveAppClient;
}

let cachedComposition: SdkworkAppbasePcAuthRuntimeComposition | null = null;

export function invalidateAssetsIamRuntime(): void {
  cachedComposition = null;
}

function normalizeGeneratedSdkBaseUrl(baseUrl: string, apiPrefix: string): string {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedApiPrefix = apiPrefix.replace(/\/+$/, '');
  if (normalizedBaseUrl.endsWith(normalizedApiPrefix)) {
    return normalizedBaseUrl.slice(0, -normalizedApiPrefix.length) || normalizedBaseUrl;
  }
  return normalizedBaseUrl;
}

function toIamDeploymentMode(): IamDeploymentMode {
  return getAssetsDeploymentProfile() === 'cloud' ? 'saas' : 'local';
}

function toIamEnvironment(value: string): IamEnvironment {
  if (value === 'production' || value === 'staging') {
    return 'prod';
  }
  if (value === 'test') {
    return 'test';
  }
  return 'dev';
}

function toBridgeSession(
  snapshot: AssetsSessionSnapshot,
): SdkworkAppbasePcAuthSessionBridgeSession | null {
  if (!snapshot.authToken && !snapshot.accessToken) {
    return null;
  }

  return {
    ...(snapshot.accessToken ? { accessToken: snapshot.accessToken } : {}),
    ...(snapshot.authToken ? { authToken: snapshot.authToken } : {}),
    ...(snapshot.refreshToken ? { refreshToken: snapshot.refreshToken } : {}),
    ...(snapshot.sessionId ? { sessionId: snapshot.sessionId } : {}),
  };
}

function createAppbaseAppClient(tokenManager: AuthTokenManager): SdkworkAppClient {
  return createClient({
    authMode: 'dual-token',
    baseUrl: normalizeGeneratedSdkBaseUrl(getPlatformApiGatewayHttpUrl(), APP_API_PREFIX),
    platform: 'pc',
    tokenManager,
  });
}

function createAssetsIamComposition(): SdkworkAppbasePcAuthRuntimeComposition {
  const tokenManager = createTokenManager();
  const appbaseApp = createAppbaseAppClient(tokenManager);

  return createSdkworkAppbasePcAuthRuntime({
    app: {
      appId: APP_ID,
      deploymentMode: toIamDeploymentMode(),
      environment: toIamEnvironment(getAssetsEnvironment()),
      platform: 'pc',
    },
    baseUrls: {
      appbaseAppApiBaseUrl: getPlatformApiGatewayHttpUrl(),
    },
    createAppbaseAppClient: () => appbaseApp,
    hooks: {
      onSessionChanged: () => {
        resetDriveAppClient();
      },
    },
    sessionBridge: {
      clearSession: () => {
        assetsSessionStore.clearSession();
      },
      commitSession: (session) => {
        assetsSessionStore.setSession({
          accessToken: session.accessToken,
          authToken: session.authToken,
          refreshToken: session.refreshToken,
          sessionId: session.sessionId,
        });
        return session;
      },
      readSession: () => toBridgeSession(assetsSessionStore.refreshSession()),
    },
    tokenManager,
    sdkClients: [],
  });
}

export function getAssetsIamComposition(): SdkworkAppbasePcAuthRuntimeComposition {
  if (!cachedComposition) {
    cachedComposition = createAssetsIamComposition();
  }
  return cachedComposition;
}

export function getAssetsIamBundle(): AssetsIamBundle {
  const composition = getAssetsIamComposition();
  const tokenManager = composition.tokenManager;

  return {
    tokenManager,
    appbaseApp: composition.appbaseApp,
    runtime: composition.runtime,
    createDriveClient: () =>
      createDriveAppClient({
        authMode: 'dual-token',
        baseUrl: normalizeGeneratedSdkBaseUrl(getPlatformApiGatewayHttpUrl(), APP_API_PREFIX),
        platform: 'web',
        tokenManager,
      }),
  };
}

export async function bootstrapAssetsIamSession(): Promise<boolean> {
  const { runtime, tokenManager } = getAssetsIamBundle();
  await runtime.hydrateTokenManager();

  const tokens = tokenManager.getTokens();
  if (!tokens?.authToken || !tokens.accessToken) {
    assetsSessionStore.clearSession();
    invalidateAssetsIamRuntime();
    return false;
  }

  try {
    await runtime.service.auth.sessions.current.retrieve();
    return true;
  } catch {
    await runtime.service.auth.sessions.current.delete().catch(() => undefined);
    assetsSessionStore.clearSession();
    invalidateAssetsIamRuntime();
    return false;
  }
}
