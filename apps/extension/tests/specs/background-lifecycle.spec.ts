import { test, expect } from '../fixtures/background-fixture';
import { EExtensionState } from '@/constants';

test.describe('Background Service Worker Lifecycle', () => {
  test('onInstalled writes extState=active on first install', async ({
    isolatedBackground,
  }) => {
    await expect
      .poll(async () => isolatedBackground.readStorage<string>('extState'))
      .toBe(EExtensionState.ACTIVE);
  });
});
