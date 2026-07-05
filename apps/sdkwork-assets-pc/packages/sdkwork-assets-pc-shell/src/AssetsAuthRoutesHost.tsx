import type { SdkworkIamAuthRoutesProps } from '@sdkwork/auth-pc-react';
import { Suspense, lazy, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  resolveAssetsAuthAppearance,
  resolveAssetsAuthLocale,
  resolveAssetsAuthRuntimeConfig,
} from '@sdkwork/assets-pc-auth';
import { getAssetsIamBundle } from '@sdkwork/assets-pc-core';

const SdkworkIamAuthRoutes = lazy(() =>
  import('@sdkwork/auth-pc-react').then((module) => ({ default: module.SdkworkIamAuthRoutes })),
);

function AuthRoutesFallback() {
  const { t } = useTranslation();
  return <main className="auth-bootstrap">{t('loading')}</main>;
}

export function AssetsAuthRoutesHost() {
  const { i18n } = useTranslation();

  const authRouteProps = useMemo(() => ({
    appearance: resolveAssetsAuthAppearance(),
    basePath: '/auth',
    getRuntime: () => getAssetsIamBundle().runtime,
    homePath: '/',
    locale: resolveAssetsAuthLocale(i18n.language),
    runtimeConfig: resolveAssetsAuthRuntimeConfig(),
    viewportMode: 'fixed' as const,
  }), [i18n.language]);

  return (
    <Suspense fallback={<AuthRoutesFallback />}>
      <SdkworkIamAuthRoutes {...(authRouteProps as unknown as SdkworkIamAuthRoutesProps)} />
    </Suspense>
  );
}
