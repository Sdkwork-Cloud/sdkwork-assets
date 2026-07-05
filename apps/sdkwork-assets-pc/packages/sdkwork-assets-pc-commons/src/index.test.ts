import { describe, expect, it } from 'vitest';
import { formatAssetKindLabel, formatAssetTimestamp, normalizeString } from './index';

describe('assets commons', () => {
  it('normalizes strings', () => {
    expect(normalizeString('  hello  ')).toBe('hello');
  });

  it('formats asset kind labels', () => {
    expect(formatAssetKindLabel('ai_generated')).toBe('Ai Generated');
  });

  it('formats timestamps', () => {
    const formatted = formatAssetTimestamp('2026-01-15T10:00:00.000Z');
    expect(formatted).toBeTruthy();
  });
});
