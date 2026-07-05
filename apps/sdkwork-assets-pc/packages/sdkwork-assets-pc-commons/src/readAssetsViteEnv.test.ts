import { describe, expect, it } from 'vitest';

import { readAssetsViteEnv } from './readAssetsViteEnv';

describe('readAssetsViteEnv', () => {
  it('returns trimmed values from import meta env', () => {
    expect(readAssetsViteEnv('MODE')).toBeTruthy();
  });
});
