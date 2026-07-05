import { readAssetsViteEnv } from '@sdkwork/assets-pc-commons';

const TOPOLOGY_ENVIRONMENTS = new Set(['development', 'production']);

export type AssetsEnvironment = 'development' | 'test' | 'staging' | 'production';

export function getAssetsEnvironment(): AssetsEnvironment {
  const env = readAssetsViteEnv('VITE_SDKWORK_ASSETS_ENVIRONMENT')
    || readAssetsViteEnv('VITE_APP_ENV')
    || readAssetsViteEnv('MODE');

  if (env === 'production' || env === 'prod') return 'production';
  if (env === 'staging' || env === 'stage') return 'staging';
  if (env === 'test') return 'test';
  return 'development';
}

export function getPlatformApiGatewayHttpUrl(): string {
  const topologyUrl = readAssetsViteEnv('VITE_SDKWORK_ASSETS_PLATFORM_API_GATEWAY_HTTP_URL');
  if (topologyUrl) {
    return topologyUrl;
  }

  const env = readAssetsViteEnv('VITE_SDKWORK_ASSETS_ENVIRONMENT');
  if (env && TOPOLOGY_ENVIRONMENTS.has(env)) {
    return env === 'production' ? 'https://api.sdkwork.com' : 'https://api-dev.sdkwork.com';
  }

  return import.meta.env.PROD ? 'https://api.sdkwork.com' : 'http://127.0.0.1:3900';
}

export function getAssetsDeploymentProfile(): 'standalone' | 'cloud' {
  const profile = readAssetsViteEnv('VITE_SDKWORK_ASSETS_DEPLOYMENT_PROFILE')
    || readAssetsViteEnv('SDKWORK_ASSETS_DEPLOYMENT_PROFILE');
  return profile === 'cloud' ? 'cloud' : 'standalone';
}
