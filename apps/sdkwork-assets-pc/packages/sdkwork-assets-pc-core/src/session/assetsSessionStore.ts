import { isBlank, trim } from '@sdkwork/utils';

export interface AssetsSessionSnapshot {
  accessToken?: string;
  authToken?: string;
  refreshToken?: string;
  sessionId?: string;
  tenantId?: string;
  organizationId?: string;
  userId?: string;
}

const SESSION_STORAGE_KEY = 'sdkwork-assets-auth-session';
const listeners = new Set<() => void>();
let memorySnapshot: AssetsSessionSnapshot = {};

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function normalizeToken(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = trim(value.replace(/^Bearer\s+/i, ''));
  return isBlank(normalized) ? undefined : normalized;
}

function normalizeSnapshot(snapshot: AssetsSessionSnapshot): AssetsSessionSnapshot {
  return {
    accessToken: normalizeToken(snapshot.accessToken),
    authToken: normalizeToken(snapshot.authToken),
    refreshToken: normalizeToken(snapshot.refreshToken),
    sessionId: trim(snapshot.sessionId ?? '') || undefined,
    tenantId: trim(snapshot.tenantId ?? '') || undefined,
    organizationId: trim(snapshot.organizationId ?? '') || undefined,
    userId: trim(snapshot.userId ?? '') || undefined,
  };
}

function hasTokens(snapshot: AssetsSessionSnapshot): boolean {
  return Boolean(snapshot.accessToken || snapshot.authToken || snapshot.refreshToken);
}

function readStorageSnapshot(): AssetsSessionSnapshot {
  if (typeof sessionStorage === 'undefined') {
    return {};
  }

  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return normalizeSnapshot(JSON.parse(raw) as AssetsSessionSnapshot);
  } catch {
    return {};
  }
}

function writeStorageSnapshot(snapshot: AssetsSessionSnapshot): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }

  if (!hasTokens(snapshot)) {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(snapshot));
}

export class AssetsSessionStore {
  getSnapshot(): AssetsSessionSnapshot {
    return { ...memorySnapshot };
  }

  refreshSession(): AssetsSessionSnapshot {
    if (!hasTokens(memorySnapshot)) {
      memorySnapshot = readStorageSnapshot();
    }
    return this.getSnapshot();
  }

  setSession(snapshot: AssetsSessionSnapshot): void {
    memorySnapshot = normalizeSnapshot(snapshot);
    writeStorageSnapshot(memorySnapshot);
    emitChange();
  }

  clearSession(): void {
    memorySnapshot = {};
    writeStorageSnapshot({});
    emitChange();
  }

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
}

export const assetsSessionStore = new AssetsSessionStore();

export function hasAssetsIamSession(snapshot: AssetsSessionSnapshot | null | undefined): boolean {
  return Boolean(snapshot?.authToken && snapshot?.accessToken);
}
