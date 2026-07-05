import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { Toaster } from 'sonner';
import { SdkworkSessionAuthBrowserRoot } from '@sdkwork/auth-pc-react';
import { initAssetsI18n, i18n } from '@sdkwork/assets-pc-i18n';
import './index.css';

const AssetsAppShell = lazy(() =>
  import('@sdkwork/assets-pc-shell').then((module) => ({ default: module.AssetsAppShell })),
);

initAssetsI18n();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppBootstrapFallback() {
  const { t } = useTranslation();
  return <div className="auth-bootstrap">{t('bootstrapping')}</div>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SdkworkSessionAuthBrowserRoot>
            <Suspense fallback={<AppBootstrapFallback />}>
              <Routes>
                <Route path="/*" element={<AssetsAppShell />} />
              </Routes>
            </Suspense>
            <Toaster richColors position="top-right" />
          </SdkworkSessionAuthBrowserRoot>
        </BrowserRouter>
      </QueryClientProvider>
    </I18nextProvider>
  </StrictMode>,
);
