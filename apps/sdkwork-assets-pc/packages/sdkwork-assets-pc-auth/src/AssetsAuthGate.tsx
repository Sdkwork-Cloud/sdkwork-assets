import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  assetsSessionStore,
  bootstrapAssetsIamSession,
  hasAssetsIamSession,
  type AssetsSessionSnapshot,
} from '@sdkwork/assets-pc-core';

import {
  resolveAssetsAuthGateDecision,
  type AssetsAuthGateDecision,
  type AssetsAuthLocationLike,
} from './assetsAuthGateLogic';

export type { AssetsAuthGateDecision, AssetsAuthLocationLike };
export {
  buildAssetsAuthLoginRedirect,
  isAssetsIamEnforced,
  resolveAssetsAuthGateDecision,
  sanitizeAssetsAuthRedirect,
} from './assetsAuthGateLogic';

export interface AssetsAuthGateProps {
  authRoutes?: React.ReactNode;
  children: React.ReactNode;
  homePath?: string;
  location?: AssetsAuthLocationLike;
  navigate?: (to: string, options: { replace: true }) => void;
}

const DEFAULT_HOME_PATH = '/';

function AuthGateBootstrappingMessage() {
  const { t } = useTranslation();
  return <>{t('validatingSession')}</>;
}

export function AssetsAuthGate({
  authRoutes,
  children,
  homePath = DEFAULT_HOME_PATH,
  location,
  navigate,
}: AssetsAuthGateProps) {
  const [bootstrapping, setBootstrapping] = useState(true);
  const [snapshot, setSnapshot] = useState<AssetsSessionSnapshot>(() => assetsSessionStore.getSnapshot());
  const currentLocation = useBrowserLocation(location);

  useEffect(() => {
    let cancelled = false;
    void bootstrapAssetsIamSession().then(() => {
      if (!cancelled) {
        setBootstrapping(false);
        setSnapshot(assetsSessionStore.refreshSession());
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSnapshot(assetsSessionStore.refreshSession());
    return assetsSessionStore.subscribe(() => {
      setSnapshot(assetsSessionStore.refreshSession());
    });
  }, [currentLocation.pathname, currentLocation.search, currentLocation.hash]);

  const decision = useMemo(
    () =>
      resolveAssetsAuthGateDecision({
        hasSession: hasAssetsIamSession(snapshot),
        homePath,
        location: currentLocation,
      }),
    [currentLocation, homePath, snapshot],
  );

  useEffect(() => {
    if (decision.kind !== 'redirect') {
      return;
    }
    if (navigate) {
      navigate(decision.to, { replace: true });
      return;
    }
    if (typeof window !== 'undefined') {
      window.location.replace(decision.to);
    }
  }, [decision, navigate]);

  if (bootstrapping) {
    return (
      <main className="auth-bootstrap">
        <AuthGateBootstrappingMessage />
      </main>
    );
  }

  if (decision.kind === 'redirect') {
    return null;
  }

  if (decision.kind === 'auth-route') {
    return <>{authRoutes}</>;
  }

  return <>{children}</>;
}

function useBrowserLocation(
  location: AssetsAuthLocationLike | undefined,
): AssetsAuthLocationLike {
  const [browserLocation, setBrowserLocation] = useState<AssetsAuthLocationLike>(
    () => location ?? readBrowserLocation(),
  );

  useEffect(() => {
    if (location) {
      setBrowserLocation(location);
      return undefined;
    }
    if (typeof window === 'undefined') {
      return undefined;
    }

    const update = () => setBrowserLocation(readBrowserLocation());
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
    };
  }, [location]);

  return browserLocation;
}

function readBrowserLocation(): AssetsAuthLocationLike {
  if (typeof window === 'undefined') {
    return { pathname: DEFAULT_HOME_PATH, search: '', hash: '' };
  }
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
  };
}
