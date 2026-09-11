import { EStorageKey } from '@bypass/shared';
import { TEST_TIMEOUTS } from '@bypass/shared/tests';
import { expect, test } from '@playwright/test';

import { openExtensionPanelPage } from '../fixtures/base-fixture';
import {
  GOOGLE_LOGOUT_TABS,
  withSignedInProfile,
} from '../utils/signed-in-profile';
import { getStorageItem } from '../utils/test-utils';

test.describe('Auth lifecycle', () => {
  test('clears synced storage and opens the account tabs on logout', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(context, extensionId);
      const tabsBefore = context.pages().length;

      await page.getByTestId('logout-button').click();

      await expect(page.getByTestId('login-button')).toBeVisible({
        timeout: TEST_TIMEOUTS.AUTH,
      });
      expect(await getStorageItem(page, EStorageKey.bookmarks)).toBeUndefined();
      expect(await getStorageItem(page, EStorageKey.persons)).toBeUndefined();
      expect(
        await getStorageItem(page, EStorageKey.redirections)
      ).toBeUndefined();
      await expect
        .poll(() => context.pages().length, {
          timeout: TEST_TIMEOUTS.PAGE_OPEN,
        })
        .toBe(tabsBefore + GOOGLE_LOGOUT_TABS.length);
    });
  });

  test('signs out on its own when the extension is switched off', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(context, extensionId);

      await page.getByTestId('toggle-extension-switch').click();

      await expect(page.getByTestId('login-button')).toBeVisible({
        timeout: TEST_TIMEOUTS.AUTH,
      });
    });
  });
});
