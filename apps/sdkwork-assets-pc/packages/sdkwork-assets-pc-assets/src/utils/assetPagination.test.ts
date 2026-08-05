import { describe, expect, it } from 'vitest';
import { getNextAssetsCursor } from './assetPagination';

describe('getNextAssetsCursor', () => {
  it('returns nextCursor when present', () => {
    expect(getNextAssetsCursor({ items: [], pageInfo: { mode: 'cursor', nextCursor: 'cursor-2' } })).toBe('cursor-2');
  });

  it('returns undefined when nextCursor is absent', () => {
    expect(getNextAssetsCursor({ items: [], pageInfo: { mode: 'cursor' } })).toBeUndefined();
    expect(getNextAssetsCursor({ items: [], pageInfo: { mode: 'cursor', nextCursor: null } })).toBeUndefined();
  });
});
