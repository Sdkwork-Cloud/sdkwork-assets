import { describe, expect, it } from 'vitest';
import { buildListAssetsQuery } from './assetListFilters';

describe('buildListAssetsQuery', () => {
  it('omits blank search and filter values', () => {
    expect(buildListAssetsQuery({ search: '  ', kind: '', sourceType: '' })).toEqual({});
  });

  it('passes drive list query params when set', () => {
    expect(
      buildListAssetsQuery({
        search: 'logo',
        kind: 'image',
        sourceType: 'upload',
        cursor: 'c1',
        pageSize: 12,
      }),
    ).toEqual({
      q: 'logo',
      kind: 'image',
      sourceType: 'upload',
      cursor: 'c1',
      pageSize: 12,
    });
  });
});
