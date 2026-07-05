import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AssetItem } from '@sdkwork/drive-app-sdk';
import { formatAssetKindLabel } from '@sdkwork/assets-pc-commons';
import { AssetsListFiltersBar } from './AssetsListFiltersBar';
import {
  flattenAssetPages,
  matchesAssetViewFilter,
  useAssetsListInfiniteQuery,
  type AssetKindFilter,
  type AssetSourceTypeFilter,
} from '../hooks/useAssetsListInfiniteQuery';

export interface ChooseAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: AssetItem) => void;
}

export function ChooseAssetDialog({ open, onClose, onSelect }: ChooseAssetDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<AssetKindFilter>('');
  const [sourceType, setSourceType] = useState<AssetSourceTypeFilter>('');

  const assetsQuery = useAssetsListInfiniteQuery({
    queryScope: 'picker',
    search,
    kind,
    sourceType,
    pageSize: 12,
    enabled: open,
  });

  const items = useMemo(
    () => flattenAssetPages(assetsQuery.data?.pages).filter((asset) =>
      matchesAssetViewFilter(asset, 'active'),
    ),
    [assetsQuery.data?.pages],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="choose-asset-overlay" role="dialog" aria-modal="true">
      <div className="choose-asset-dialog">
        <header className="choose-asset-dialog__header">
          <h2>{t('chooseAsset')}</h2>
          <button type="button" onClick={onClose}>{t('cancel')}</button>
        </header>
        <AssetsListFiltersBar
          search={search}
          kind={kind}
          sourceType={sourceType}
          onSearchChange={setSearch}
          onKindChange={setKind}
          onSourceTypeChange={setSourceType}
        />
        {assetsQuery.isLoading ? <p>{t('loading')}</p> : null}
        {assetsQuery.isError ? <p className="assets-error">{t('error')}</p> : null}
        {!assetsQuery.isLoading && items.length === 0 ? <p>{t('noAssets')}</p> : null}
        <ul className="choose-asset-list">
          {items.map((asset) => (
            <li key={asset.assetId}>
              <button type="button" className="choose-asset-item" onClick={() => onSelect(asset)}>
                <span className="choose-asset-item__title">{asset.title}</span>
                <span className="choose-asset-item__meta">{formatAssetKindLabel(asset.assetKind)}</span>
              </button>
            </li>
          ))}
        </ul>
        {assetsQuery.hasNextPage ? (
          <button
            type="button"
            className="assets-card__action"
            disabled={assetsQuery.isFetchingNextPage}
            onClick={() => void assetsQuery.fetchNextPage()}
          >
            {assetsQuery.isFetchingNextPage ? t('loading') : t('loadMore')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
