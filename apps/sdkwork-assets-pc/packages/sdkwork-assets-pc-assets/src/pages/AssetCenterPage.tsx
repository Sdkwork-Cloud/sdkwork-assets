import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Archive, RotateCcw, Upload } from 'lucide-react';
import { useDriveAppClient } from '@sdkwork/assets-pc-core';
import { formatAssetKindLabel, formatAssetTimestamp } from '@sdkwork/assets-pc-commons';
import { AssetsListFiltersBar } from '../components/AssetsListFiltersBar';
import { createAssetCatalogService } from '../services/assetCatalogService';
import { patchAssetLifecycleInCache } from '../hooks/assetListCache';
import {
  flattenAssetPages,
  matchesAssetViewFilter,
  useAssetsListInfiniteQuery,
  type AssetKindFilter,
  type AssetSourceTypeFilter,
  type AssetViewFilter,
} from '../hooks/useAssetsListInfiniteQuery';

export function AssetCenterPage() {
  const { t, i18n } = useTranslation();
  const client = useDriveAppClient();
  const service = useMemo(() => createAssetCatalogService(client), [client]);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<AssetKindFilter>('');
  const [sourceType, setSourceType] = useState<AssetSourceTypeFilter>('');
  const [viewFilter, setViewFilter] = useState<AssetViewFilter>('active');
  const [uploading, setUploading] = useState(false);
  const [actionAssetId, setActionAssetId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const assetsQuery = useAssetsListInfiniteQuery({
    queryScope: 'list',
    search,
    kind,
    sourceType,
  });

  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setActionError(null);
    try {
      await service.uploadAsset({ file, scene: 'app_upload', source: 'sdkwork-assets' });
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('error'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }, [queryClient, service, t]);

  const handleArchive = useCallback(async (assetId: string) => {
    setActionAssetId(assetId);
    setActionError(null);
    try {
      const updated = await service.archiveAsset(assetId);
      patchAssetLifecycleInCache(queryClient, assetId, updated.lifecycleStatus);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('error'));
    } finally {
      setActionAssetId(null);
    }
  }, [queryClient, service, t]);

  const handleRestore = useCallback(async (assetId: string) => {
    setActionAssetId(assetId);
    setActionError(null);
    try {
      const updated = await service.restoreAsset(assetId);
      patchAssetLifecycleInCache(queryClient, assetId, updated.lifecycleStatus);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('error'));
    } finally {
      setActionAssetId(null);
    }
  }, [queryClient, service, t]);

  const items = flattenAssetPages(assetsQuery.data?.pages).filter((asset) =>
    matchesAssetViewFilter(asset, viewFilter),
  );

  return (
    <section className="assets-page">
      <header className="assets-page__header">
        <div>
          <h1>{t('assetCenter')}</h1>
          <p className="assets-page__subtitle">{t('assetCenterSubtitle')}</p>
        </div>
        <label className="assets-upload-button">
          <Upload size={16} />
          <span>{uploading ? t('loading') : t('upload')}</span>
          <input type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
      </header>

      <AssetsListFiltersBar
        search={search}
        kind={kind}
        sourceType={sourceType}
        onSearchChange={setSearch}
        onKindChange={setKind}
        onSourceTypeChange={setSourceType}
      />

      <div className="assets-view-filter" role="tablist" aria-label={t('viewFilter')}>
        {(['active', 'archived', 'all'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={viewFilter === filter}
            className={viewFilter === filter ? 'active' : undefined}
            onClick={() => setViewFilter(filter)}
          >
            {t(`viewFilter_${filter}`)}
          </button>
        ))}
      </div>

      {assetsQuery.isLoading ? <p>{t('loading')}</p> : null}
      {assetsQuery.isError ? <p className="assets-error">{t('error')}</p> : null}
      {actionError ? <p className="assets-error">{actionError}</p> : null}

      {!assetsQuery.isLoading && items.length === 0 ? <p>{t('noAssets')}</p> : null}

      <ul className="assets-grid">
        {items.map((asset) => (
          <li key={asset.assetId} className="assets-card">
            <div className="assets-card__title">{asset.title}</div>
            <div className="assets-card__meta">
              <span>{formatAssetKindLabel(asset.assetKind)}</span>
              {asset.sourceType ? <span>{t(`sourceType_${asset.sourceType}`, asset.sourceType)}</span> : null}
              <span>{asset.lifecycleStatus}</span>
            </div>
            <div className="assets-card__meta muted">
              {t('updatedAt')}: {formatAssetTimestamp(asset.updatedAt, i18n.language)}
            </div>
            <div className="assets-card__actions">
              {asset.lifecycleStatus === 'archived' ? (
                <button
                  type="button"
                  className="assets-card__action"
                  disabled={actionAssetId === asset.assetId}
                  onClick={() => void handleRestore(asset.assetId)}
                >
                  <RotateCcw size={14} />
                  <span>{t('restore')}</span>
                </button>
              ) : asset.lifecycleStatus === 'active' ? (
                <button
                  type="button"
                  className="assets-card__action"
                  disabled={actionAssetId === asset.assetId}
                  onClick={() => void handleArchive(asset.assetId)}
                >
                  <Archive size={14} />
                  <span>{t('archive')}</span>
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {assetsQuery.hasNextPage ? (
        <div className="assets-page__footer">
          <button
            type="button"
            className="assets-card__action"
            disabled={assetsQuery.isFetchingNextPage}
            onClick={() => void assetsQuery.fetchNextPage()}
          >
            {assetsQuery.isFetchingNextPage ? t('loading') : t('loadMore')}
          </button>
        </div>
      ) : null}
    </section>
  );
}
