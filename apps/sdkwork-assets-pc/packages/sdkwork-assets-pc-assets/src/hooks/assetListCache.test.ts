import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { patchAssetLifecycleInCache } from './assetListCache';

describe('patchAssetLifecycleInCache', () => {
  it('updates lifecycleStatus for matching asset across pages', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(['assets', 'list', ''], {
      pages: [
        {
          items: [
            { assetId: 'a1', lifecycleStatus: 'active', title: 'One' },
            { assetId: 'a2', lifecycleStatus: 'active', title: 'Two' },
          ],
        },
      ],
      pageParams: [undefined],
    });

    patchAssetLifecycleInCache(queryClient, 'a2', 'archived');

    const data = queryClient.getQueryData<{ pages: { items: { assetId: string; lifecycleStatus: string }[] }[] }>([
      'assets',
      'list',
      '',
    ]);
    expect(data?.pages[0]?.items[1]?.lifecycleStatus).toBe('archived');
    expect(data?.pages[0]?.items[0]?.lifecycleStatus).toBe('active');
  });
});
