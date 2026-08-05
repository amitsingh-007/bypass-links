import { EExtensionState, EXT_STORAGE_KEYS } from '@/constants';

import { test, expect } from '../fixtures/background-fixture';

test.describe('Background Service Worker Lifecycle', () => {
  test('onInstalled writes extState=active on first install', async ({
    isolatedBackground,
  }) => {
    await expect
      .poll(async () =>
        isolatedBackground.readStorage<string>(EXT_STORAGE_KEYS.extState)
      )
      .toBe(EExtensionState.ACTIVE);
  });
});
