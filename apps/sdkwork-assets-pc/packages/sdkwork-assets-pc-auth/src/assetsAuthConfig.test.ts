import { describe, expect, it } from 'vitest';

import { resolveAssetsAuthLocale } from './assetsAuthConfig';

describe('resolveAssetsAuthLocale', () => {
  it('maps app languages to IAM locales', () => {
    expect(resolveAssetsAuthLocale('en')).toBe('en-US');
    expect(resolveAssetsAuthLocale('zh-CN')).toBe('zh-CN');
    expect(resolveAssetsAuthLocale(undefined)).toBeNull();
  });
});
