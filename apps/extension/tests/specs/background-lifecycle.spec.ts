import { EExtensionState, EExtStorageKey } from '@/constants';

import { test, expect } from '../fixtures/background-fixture';
import { createSharedBackgroundSW } from '../fixtures/base-fixture';

test.describe('Background Service Worker Lifecycle', () => {
  test('onInstalled writes extState=active on first install', async ({
    isolatedBackground,
  }) => {
    await expect
      .poll(async () =>
        isolatedBackground.readStorage(EExtStorageKey.EXT_STATE)
      )
      .toBe(EExtensionState.ACTIVE);
  });

  /** The host never resolves, so an unintercepted fetch rejects instead of passing. */
  test('context routing reaches requests made by the worker itself', async ({
    isolatedBackground,
  }) => {
    const probeUrl = 'https://worker-route-probe.test/';
    await isolatedBackground.context.route(probeUrl, async (route) => {
      await route.fulfill({ contentType: 'text/plain', body: 'intercepted' });
    });
    const backgroundSW = await createSharedBackgroundSW(
      isolatedBackground.context
    );

    const body = await backgroundSW.evaluate(async (url) => {
      const response = await fetch(url);
      return response.text();
    }, probeUrl);

    expect(body).toBe('intercepted');
  });
});
