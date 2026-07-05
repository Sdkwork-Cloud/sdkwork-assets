import { Archive, Search, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AssetGallerySource, AssetGalleryType } from './types';

export interface AssetGalleryEmptyStateProps {
  activeTab: AssetGallerySource;
  filterType: AssetGalleryType | 'all';
  searchQuery: string;
  onClearSearch?: () => void;
}

export function AssetGalleryEmptyState({
  activeTab,
  filterType,
  searchQuery,
  onClearSearch,
}: AssetGalleryEmptyStateProps) {
  const { t } = useTranslation();
  const hasSearch = Boolean(searchQuery.trim());

  const title = hasSearch
    ? t('galleryEmpty_searchTitle')
    : t(`galleryEmpty_${activeTab}Title`, { defaultValue: t('galleryEmpty_defaultTitle') });
  const description = hasSearch
    ? t('galleryEmpty_searchDesc')
    : t(`galleryEmpty_${activeTab}Desc`, { defaultValue: t('galleryEmpty_defaultDesc') });
  const action = hasSearch
    ? t('galleryEmpty_clearSearch')
    : t(`galleryEmpty_${activeTab}Action`, { defaultValue: t('galleryEmpty_defaultAction') });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/5">
        {hasSearch ? <Search className="h-12 w-12 text-gray-600" /> : <Archive className="h-12 w-12 text-gray-600" />}
      </div>
      <div className="text-center">
        <h3 className="mb-2 text-lg font-semibold text-gray-300">{title}</h3>
        <p className="max-w-md text-sm text-gray-500">{description}</p>
        {filterType !== 'all' ? (
          <p className="mt-2 text-xs text-gray-600">{t('galleryEmpty_filterHint')}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClearSearch}
        className="mt-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-400/30 transition-all hover:from-cyan-500 hover:to-blue-600"
      >
        {activeTab === 'uploaded' && !hasSearch ? (
          <>
            <Upload className="mr-2 inline h-5 w-5" />
            {action}
          </>
        ) : (
          action
        )}
      </button>
    </div>
  );
}
