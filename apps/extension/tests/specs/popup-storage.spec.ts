import { expect, test } from '@playwright/test';

import { EExtensionState, EExtStorageKey } from '@/constants';

import {
  removeStorageFromWorker,
  writeStorageFromWorker,
} from '../fixtures/background-fixture';
import {
  createSharedBackgroundSW,
  getExtensionId,
  getPopupUrl,
  withTempProfileContext,
} from '../fixtures/base-fixture';
import { getStorageItem } from '../utils/test-utils';

const STATE_KEY = EExtStorageKey.EXT_STATE;
const HISTORY_KEY = EExtStorageKey.HISTORY_START_TIME;

test.describe('Popup storage subscriptions', () => {
  test('updates both popup pages from writes and removal fallbacks', async () => {
    await withTempProfileContext({}, async (context) => {
      const backgroundSW = await createSharedBackgroundSW(context);
      const popupUrl = getPopupUrl(await getExtensionId(backgroundSW));
      await removeStorageFromWorker(backgroundSW, HISTORY_KEY);
      const first = await context.newPage();
      const second = await context.newPage();
      await first.goto(popupUrl);
      await second.goto(popupUrl);
      for (const page of [first, second]) {
        await expect(page.getByTestId('login-button')).toBeEnabled();
        await expect(
          page.getByTestId('toggle-history-switch')
        ).not.toBeChecked();
      }

      await first.getByTestId('toggle-history-switch').click();
      for (const page of [first, second]) {
        await expect(page.getByTestId('toggle-history-switch')).toBeChecked();
      }
      await removeStorageFromWorker(backgroundSW, HISTORY_KEY);
      for (const page of [first, second]) {
        await expect(
          page.getByTestId('toggle-history-switch')
        ).not.toBeChecked();
      }

      await first.getByTestId('toggle-extension-switch').click();
      for (const page of [first, second]) {
        await expect(
          page.getByTestId('toggle-extension-switch')
        ).not.toBeChecked();
        await expect(page.getByTestId('login-button')).toBeDisabled();
        await expect(page.getByTestId('toggle-history-switch')).toBeDisabled();
      }
      await removeStorageFromWorker(backgroundSW, STATE_KEY);
      for (const page of [first, second]) {
        await expect(page.getByTestId('toggle-extension-switch')).toBeChecked();
        await expect(page.getByTestId('login-button')).toBeEnabled();
        await expect(page.getByTestId('toggle-history-switch')).toBeEnabled();
      }
    });
  });

  test('cleans persisted history when the extension is inactive', async () => {
    await withTempProfileContext({}, async (context) => {
      const backgroundSW = await createSharedBackgroundSW(context);
      const extensionId = await getExtensionId(backgroundSW);
      const visit = 'https://history-cleanup.test/';
      await writeStorageFromWorker(backgroundSW, {
        [STATE_KEY]: EExtensionState.INACTIVE,
        [HISTORY_KEY]: Date.now() - 30_000,
      });
      await backgroundSW.evaluate(
        async (url) => chrome.history.addUrl({ url }),
        visit
      );
      const page = await context.newPage();
      await page.goto(getPopupUrl(extensionId));

      await expect(page.getByTestId('toggle-history-switch')).toBeDisabled();
      await expect
        .poll(() => getStorageItem(page, HISTORY_KEY))
        .toBeUndefined();
      await expect(page.getByTestId('toggle-history-switch')).not.toBeChecked();
      expect(
        await backgroundSW.evaluate(
          async (url) => chrome.history.search({ text: url, startTime: 0 }),
          visit
        )
      ).toEqual([]);
    });
  });
});
