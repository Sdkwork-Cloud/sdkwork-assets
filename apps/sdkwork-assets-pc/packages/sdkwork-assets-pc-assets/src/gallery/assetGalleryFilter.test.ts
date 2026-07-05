import { describe, expect, it } from 'vitest';
import { filterAssetGalleryItems, sortAssetGalleryItems } from './assetGalleryFilter';
import type { AssetGalleryItem } from './types';

const sampleAssets: AssetGalleryItem[] = [
  {
    id: 'a',
    type: 'image',
    title: 'Alpha',
    createdAt: new Date('2026-01-02T00:00:00Z'),
    source: 'created',
  },
  {
    id: 'b',
    type: 'video',
    title: 'Beta',
    createdAt: new Date('2026-01-03T00:00:00Z'),
    source: 'created',
  },
];

describe('filterAssetGalleryItems', () => {
  it('filters by tab and type', () => {
    const filtered = filterAssetGalleryItems({
      assets: sampleAssets,
      activeTab: 'created',
      filterType: 'video',
      searchQuery: '',
      sortBy: 'date',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('b');
  });

  it('sorts by name', () => {
    const sorted = sortAssetGalleryItems(sampleAssets, 'name');
    expect(sorted.map((item) => item.id)).toEqual(['a', 'b']);
  });
});
