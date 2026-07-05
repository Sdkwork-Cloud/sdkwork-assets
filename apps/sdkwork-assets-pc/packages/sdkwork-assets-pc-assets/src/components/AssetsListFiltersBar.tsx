import { useTranslation } from 'react-i18next';
import { formatAssetKindLabel } from '@sdkwork/assets-pc-commons';
import {
  ASSET_KIND_FILTER_VALUES,
  ASSET_SOURCE_TYPE_FILTER_VALUES,
  type AssetKindFilter,
  type AssetSourceTypeFilter,
} from '../utils/assetListFilters';

export interface AssetsListFiltersBarProps {
  search: string;
  kind: AssetKindFilter;
  sourceType: AssetSourceTypeFilter;
  onSearchChange: (value: string) => void;
  onKindChange: (value: AssetKindFilter) => void;
  onSourceTypeChange: (value: AssetSourceTypeFilter) => void;
}

export function AssetsListFiltersBar({
  search,
  kind,
  sourceType,
  onSearchChange,
  onKindChange,
  onSourceTypeChange,
}: AssetsListFiltersBarProps) {
  const { t } = useTranslation();

  return (
    <div className="assets-toolbar">
      <input
        className="assets-search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
      />
      <label className="assets-filter">
        <span className="assets-filter__label">{t('kind')}</span>
        <select
          value={kind}
          onChange={(event) => onKindChange(event.target.value as AssetKindFilter)}
          aria-label={t('kindFilter')}
        >
          <option value="">{t('filterAll')}</option>
          {ASSET_KIND_FILTER_VALUES.map((value) => (
            <option key={value} value={value}>
              {formatAssetKindLabel(value)}
            </option>
          ))}
        </select>
      </label>
      <label className="assets-filter">
        <span className="assets-filter__label">{t('source')}</span>
        <select
          value={sourceType}
          onChange={(event) => onSourceTypeChange(event.target.value as AssetSourceTypeFilter)}
          aria-label={t('sourceFilter')}
        >
          <option value="">{t('filterAll')}</option>
          {ASSET_SOURCE_TYPE_FILTER_VALUES.map((value) => (
            <option key={value} value={value}>
              {t(`sourceType_${value}`)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
