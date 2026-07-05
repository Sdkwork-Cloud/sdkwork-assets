import { isBlank, trim } from '@sdkwork/utils';

export function readAssetsViteEnv(key: string): string | undefined {
  const assetsEnv = (globalThis as { __SDKWORK_ASSETS_ENV__?: Record<string, string> }).__SDKWORK_ASSETS_ENV__;
  const importMetaEnv = (import.meta as { env?: Record<string, string> }).env;
  const value = assetsEnv?.[key] ?? importMetaEnv?.[key];
  const normalized = typeof value === 'string' ? trim(value) : '';
  return isBlank(normalized) ? undefined : normalized;
}
