import { EExtensionState, EExtStorageKey } from '@/constants';

import { test, expect } from '../fixtures/background-fixture';

test.describe('Background Service Worker Lifecycle', () => {
  test('onInstalled writes extState=active on first install', async ({
    isolatedBackground,
  }) => {
    await expect
      .poll(async () =>
        isolatedBackground.readStorage<string>(EExtStorageKey.EXT_STATE)
      )
      .toBe(EExtensionState.ACTIVE);
  });
});
