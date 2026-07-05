import { Suspense, lazy, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { AssetsAuthGate } from '@sdkwork/assets-pc-auth';
import type { AssetItem } from '@sdkwork/assets-pc-assets';
import { AssetsAuthRoutesHost } from './AssetsAuthRoutesHost';

const AssetCenterPage = lazy(() =>
  import('@sdkwork/assets-pc-assets').then((module) => ({ default: module.AssetCenterPage })),
);
const ChooseAssetDialog = lazy(() =>
  import('@sdkwork/assets-pc-assets').then((module) => ({ default: module.ChooseAssetDialog })),
);

function ProductUiFallback() {
  const { t } = useTranslation();
  return <p className="auth-bootstrap">{t('loading')}</p>;
}

export function AssetsAppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetItem | null>(null);

  return (
    <AssetsAuthGate
      authRoutes={<AssetsAuthRoutesHost />}
      location={location}
      navigate={(to, options) => navigate(to, options)}
    >
      <div className="assets-shell">
        <aside className="assets-shell__sidebar">
          <div className="assets-shell__brand">{t('appTitle')}</div>
          <nav className="assets-shell__nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {t('assetCenter')}
            </NavLink>
            <button type="button" onClick={() => setPickerOpen(true)}>
              {t('chooseAsset')}
            </button>
          </nav>
          {selectedAsset ? (
            <div className="assets-shell__selection">
              <div className="muted">{t('selectedAsset')}</div>
              <div>{selectedAsset.title}</div>
            </div>
          ) : null}
        </aside>
        <main className="assets-shell__main">
          <Suspense fallback={<ProductUiFallback />}>
            <AssetCenterPage />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <ChooseAssetDialog
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(asset) => {
              setSelectedAsset(asset);
              setPickerOpen(false);
            }}
          />
        </Suspense>
      </div>
    </AssetsAuthGate>
  );
}
