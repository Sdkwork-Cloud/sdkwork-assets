import { isBlank, trim } from '@sdkwork/utils';
import { readAssetsViteEnv } from '@sdkwork/assets-pc-commons';

export interface AssetsAuthLocationLike {
  hash?: string;
  pathname: string;
  search?: string;
}

export type AssetsAuthGateDecision =
  | { kind: 'auth-route' }
  | { kind: 'product-route' }
  | { kind: 'redirect'; replace: true; to: string };

const DEFAULT_HOME_PATH = '/';
const AUTH_BASE_PATH = '/auth';
const AUTH_LOGIN_PATH = '/auth/login';

export function isAssetsIamEnforced(): boolean {
  const flag = readAssetsViteEnv('VITE_SDKWORK_ASSETS_IAM_REQUIRED')?.toLowerCase();
  if (flag === 'true' || flag === '1') {
    return true;
  }
  if (flag === 'false' || flag === '0') {
    return false;
  }
  return import.meta.env.PROD;
}

export function buildAssetsAuthLoginRedirect(location: AssetsAuthLocationLike): string {
  const returnPath = `${normalizePathname(location.pathname)}${location.search ?? ''}${location.hash ?? ''}`;
  return `${AUTH_LOGIN_PATH}?redirect=${encodeURIComponent(returnPath)}`;
}

export function sanitizeAssetsAuthRedirect(value: string | null | undefined): string {
  if (!value) {
    return DEFAULT_HOME_PATH;
  }

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return DEFAULT_HOME_PATH;
  }

  if (!decoded.startsWith('/') || decoded.startsWith('//')) {
    return DEFAULT_HOME_PATH;
  }

  const redirectUrl = new URL(decoded, 'http://sdkwork-assets.local');
  if (isAssetsAuthRoute(redirectUrl.pathname)) {
    return DEFAULT_HOME_PATH;
  }

  return `${redirectUrl.pathname}${redirectUrl.search}${redirectUrl.hash}`;
}

export function resolveAssetsAuthGateDecision({
  hasSession,
  homePath = DEFAULT_HOME_PATH,
  iamEnforced = isAssetsIamEnforced(),
  location,
}: {
  hasSession: boolean;
  homePath?: string;
  iamEnforced?: boolean;
  location: AssetsAuthLocationLike;
}): AssetsAuthGateDecision {
  const pathname = normalizePathname(location.pathname);
  if (isAssetsAuthRoute(pathname)) {
    if (!hasSession) {
      return { kind: 'auth-route' };
    }

    const redirect = new URLSearchParams((location.search ?? '').replace(/^\?/, '')).get('redirect');
    return {
      kind: 'redirect',
      replace: true,
      to: sanitizeAssetsAuthRedirect(redirect) || normalizePathname(homePath),
    };
  }

  if (!hasSession && iamEnforced) {
    return {
      kind: 'redirect',
      replace: true,
      to: buildAssetsAuthLoginRedirect(location),
    };
  }

  return { kind: 'product-route' };
}

function isAssetsAuthRoute(pathname: string): boolean {
  return pathname === AUTH_BASE_PATH || pathname.startsWith(`${AUTH_BASE_PATH}/`);
}

function normalizePathname(pathname: string): string {
  const normalized = trim(pathname);
  if (isBlank(normalized)) {
    return DEFAULT_HOME_PATH;
  }
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
}
