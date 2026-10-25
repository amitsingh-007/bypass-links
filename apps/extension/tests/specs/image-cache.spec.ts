import { mock } from 'node:test';

import { addAllToCache, ECacheBucketKeys } from '@bypass/shared';
import { expect, test } from '@playwright/test';

test.describe('Optional image caching', () => {
  for (const scenario of [
    'success',
    'cached',
    '404',
    'network failure',
    'write failure',
  ] as const) {
    test(`handles ${scenario} without cache logs or rejected promises`, async () => {
      const originalCaches = Object.getOwnPropertyDescriptor(
        globalThis,
        'caches'
      );
      const image = new Response('image', {
        status: scenario === '404' ? 404 : 200,
      });
      const cache = {
        match: mock.fn(async () => (scenario === 'cached' ? image : undefined)),
        put: mock.fn(async () => {
          if (scenario === 'write failure')
            throw new Error('Cache unavailable');
        }),
      };
      Object.defineProperty(globalThis, 'caches', {
        configurable: true,
        value: { open: async () => cache },
      });
      const fetchImage = mock.method(globalThis, 'fetch', async () => {
        if (scenario === 'network failure') throw new Error('Offline');
        return image;
      });
      const logs = (['debug', 'log', 'warn', 'error'] as const).map((method) =>
        mock.method(console, method, () => {})
      );
      const url = 'https://image.test/favicon.png';
      try {
        await expect(
          addAllToCache(ECacheBucketKeys.favicon, [url, url, ''])
        ).resolves.toBeUndefined();
        expect(cache.match.mock.callCount()).toBe(1);
        expect(fetchImage.mock.callCount()).toBe(scenario === 'cached' ? 0 : 1);
        expect(cache.put.mock.callCount()).toBe(
          scenario === 'success' || scenario === 'write failure' ? 1 : 0
        );
        if (scenario === 'success')
          expect(cache.put.mock.calls[0].arguments).toEqual([url, image]);
        for (const log of logs) expect(log.mock.callCount()).toBe(0);
      } finally {
        mock.restoreAll();
        if (originalCaches)
          Object.defineProperty(globalThis, 'caches', originalCaches);
        else Reflect.deleteProperty(globalThis, 'caches');
      }
    });
  }
});
