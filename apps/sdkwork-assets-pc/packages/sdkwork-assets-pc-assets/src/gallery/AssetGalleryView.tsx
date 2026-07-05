import { useMemo, useState } from 'react';
import {
  ChevronDown,
  Clock,
  Copy,
  Download,
  Grid3X3,
  LayoutGrid,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { copyTextToClipboard } from '@sdkwork/assets-pc-commons';
import { AssetGalleryCard } from './AssetGalleryCard';
import { AssetGalleryEmptyState } from './AssetGalleryEmptyState';
import {
  ASSET_GALLERY_TAB_OPTIONS,
  ASSET_GALLERY_TYPE_OPTIONS,
} from './assetGalleryConfig';
import {
  filterAssetGalleryItems,
  readAssetGalleryCopyText,
} from './assetGalleryFilter';
import type {
  AssetGalleryItem,
  AssetGallerySort,
  AssetGallerySource,
  AssetGalleryType,
  AssetGalleryViewMode,
} from './types';

export interface AssetGalleryViewProps {
  assets?: AssetGalleryItem[];
  onPreview?: (asset: AssetGalleryItem) => void;
  onDelete?: (assetIds: string[]) => void;
  onExport?: (assetIds: string[]) => void;
}

export function AssetGalleryView({
  assets = [],
  onPreview,
  onDelete,
  onExport,
}: AssetGalleryViewProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AssetGallerySource>('created');
  const [viewMode, setViewMode] = useState<AssetGalleryViewMode>('masonry');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<AssetGalleryType | 'all'>('all');
  const [sortBy, setSortBy] = useState<AssetGallerySort>('date');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const resolveTypeLabel = (type: AssetGalleryType) =>
    t(ASSET_GALLERY_TYPE_OPTIONS.find((option) => option.key === type)?.labelKey ?? type);

  const sortedAssets = useMemo(
    () =>
      filterAssetGalleryItems({
        assets,
        activeTab,
        filterType,
        searchQuery,
        sortBy,
        resolveTypeLabel,
      }),
    [assets, activeTab, filterType, searchQuery, sortBy, t],
  );

  const activeFilterOption = ASSET_GALLERY_TYPE_OPTIONS.find((option) => option.key === filterType)
    ?? ASSET_GALLERY_TYPE_OPTIONS[0]!;
  const ActiveFilterIcon = activeFilterOption.icon;

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((previous) => {
      const next = new Set(previous);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedAssets.size === sortedAssets.length) {
      setSelectedAssets(new Set());
      return;
    }
    setSelectedAssets(new Set(sortedAssets.map((asset) => asset.id)));
  };

  const copySelectedAssets = async () => {
    const text = readAssetGalleryCopyText(
      sortedAssets.filter((asset) => selectedAssets.has(asset.id)),
    );
    if (!text) {
      return;
    }
    await copyTextToClipboard(text);
  };

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden bg-[#121216] text-white">
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-white/10 bg-[#151515]">
          <div className="flex items-center gap-1 border-b border-white/5 px-6 py-3">
            {ASSET_GALLERY_TAB_OPTIONS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedAssets(new Set());
                }}
                className={`relative flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {t(tab.labelKey)}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t('gallerySearchPlaceholder', {
                    tab: t(ASSET_GALLERY_TAB_OPTIONS.find((item) => item.id === activeTab)?.labelKey ?? 'galleryTab_created'),
                  })}
                  className="w-64 rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-all focus:border-cyan-400/50 focus:bg-white/[0.07] focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-white/20"
                >
                  <ActiveFilterIcon className="h-4 w-4" />
                  {t(activeFilterOption.labelKey)}
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showFilters ? (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowFilters(false)} />
                    <div className="absolute left-0 top-full z-50 mt-2 w-56 space-y-1 rounded-xl border border-white/10 bg-[#1a1a1a] p-2 shadow-2xl">
                      {ASSET_GALLERY_TYPE_OPTIONS.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => {
                              setFilterType(option.key);
                              setShowFilters(false);
                              setSelectedAssets(new Set());
                            }}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                              filterType === option.key
                                ? 'bg-cyan-400/10 text-cyan-400'
                                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            }`}
                          >
                            <IconComponent className="h-4 w-4" />
                            <span>{t(option.labelKey)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-white/20"
              >
                <Clock className="h-4 w-4" />
                {sortBy === 'date' ? t('gallerySort_date') : t('gallerySort_name')}
              </button>

              {(filterType === 'video' || filterType === 'all') && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition-all hover:border-white/20"
                >
                  {t('galleryDuration')}
                  <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {t('galleryTotalCount', { count: sortedAssets.length })}
              </span>

              {selectedAssets.size > 0 ? (
                <>
                  <div className="h-6 w-px bg-white/10" />
                  {onDelete ? (
                    <button
                      type="button"
                      onClick={() => onDelete(Array.from(selectedAssets))}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      {t('galleryDelete', { count: selectedAssets.size })}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      void copySelectedAssets();
                    }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-white/5"
                  >
                    <Copy className="h-4 w-4" />
                    {t('galleryCopyLinks')}
                  </button>
                  {onExport ? (
                    <button
                      type="button"
                      onClick={() => onExport(Array.from(selectedAssets))}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 transition-all hover:bg-white/5"
                    >
                      <Download className="h-4 w-4" />
                      {t('galleryExport')}
                    </button>
                  ) : null}
                </>
              ) : null}

              <div className="ml-2 flex items-center rounded-lg bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-2 ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                  title={t('galleryViewGrid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('masonry')}
                  className={`rounded p-2 ${viewMode === 'masonry' ? 'bg-white/10 text-white' : 'text-gray-500'}`}
                  title={t('galleryViewMasonry')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={selectAll}
                disabled={sortedAssets.length === 0}
                className={`rounded-lg border px-3 py-2 text-sm transition-all ${
                  selectedAssets.size === sortedAssets.length && sortedAssets.length > 0
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                    : 'border-white/10 text-gray-400 hover:border-white/20 disabled:opacity-30'
                }`}
              >
                {selectedAssets.size === sortedAssets.length && sortedAssets.length > 0
                  ? t('gallerySelectedAll')
                  : t('gallerySelectAll')}
              </button>
            </div>
          </div>
        </header>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
          {sortedAssets.length === 0 ? (
            <AssetGalleryEmptyState
              activeTab={activeTab}
              filterType={filterType}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {sortedAssets.map((asset) => (
                <AssetGalleryCard
                  key={asset.id}
                  asset={asset}
                  isSelected={selectedAssets.has(asset.id)}
                  onSelect={() => toggleAssetSelection(asset.id)}
                  onPreview={() => onPreview?.(asset)}
                />
              ))}
            </div>
          ) : (
            <div className="columns-2 space-y-4 md:columns-3 lg:columns-4 xl:columns-5 2xl:columns-6">
              {sortedAssets.map((asset) => (
                <div key={asset.id} className="break-inside-avoid">
                  <AssetGalleryCard
                    asset={asset}
                    isSelected={selectedAssets.has(asset.id)}
                    onSelect={() => toggleAssetSelection(asset.id)}
                    onPreview={() => onPreview?.(asset)}
                    masonry
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
