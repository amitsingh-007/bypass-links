import { EStorageKey, sha256Hash } from '@bypass/shared';
import { LastVisitedSchema } from '@bypass/shared/schema';
import {
  failProcedure,
  routeTrpcProcedure,
  succeedProcedure,
} from '@bypass/shared/tests';
import { expect, test, type Page } from '@playwright/test';
import { z } from 'zod/mini';

import { writeStorageFromWorker } from '../fixtures/background-fixture';
import { getPopupUrl, openExtensionPanelPage } from '../fixtures/base-fixture';
import { ShortcutsPanel } from '../utils/shortcuts-panel';
import { withSignedInProfile } from '../utils/signed-in-profile';
import {
  getRedirectionStorage,
  getStorageItem,
  gotoPanel,
} from '../utils/test-utils';

const PREVIOUS_VISIT = Date.UTC(2020, 0, 2, 3, 4, 5);
const NEW_VISIT = Date.UTC(2024, 5, 6, 7, 8, 9);

const getStoredVisit = async (page: Page, hash: string) =>
  z
    .optional(LastVisitedSchema)
    .parse(await getStorageItem(page, EStorageKey.lastVisited))?.[hash];

/** A stale tooltip reports the previous row; `data-open` skips the one animating out. */
const readTooltip = async (page: Page, testId: string) => {
  const tooltip = page.locator('[data-slot="tooltip-content"][data-open]');
  await page.mouse.move(0, 0);
  await expect(tooltip).toHaveCount(0);
  await page.getByTestId(testId).hover();
  await expect(tooltip).toBeVisible();
  return tooltip.textContent();
};

test.describe('Last visited sync', () => {
  test('keeps the previous timestamp when the update fails', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        // The popup's own tab is the current one, so the extension host is hashed
        const hash = await sha256Hash(extensionId);
        let isFailing = true;
        await routeTrpcProcedure(
          context,
          'firebaseData.upsertLastVisited',
          async (call) => {
            if (isFailing) {
              await failProcedure(call);
              return;
            }
            await succeedProcedure(call, { hash, timestamp: NEW_VISIT });
          }
        );
        await writeStorageFromWorker(backgroundSW, {
          [EStorageKey.lastVisited]: { [hash]: PREVIOUS_VISIT },
        });

        const page = await openExtensionPanelPage(context, extensionId);
        const previousText = await readTooltip(page, 'last-visited-button');

        await test.step('the failed update changes nothing', async () => {
          await page.getByTestId('last-visited-button').click();

          await expect(
            page.getByText('Could not update last visited')
          ).toBeVisible();
          expect(await getStoredVisit(page, hash)).toBe(PREVIOUS_VISIT);
          expect(await readTooltip(page, 'last-visited-button')).toBe(
            previousText
          );
        });

        await test.step('retrying stores the new timestamp', async () => {
          isFailing = false;
          await page.getByTestId('last-visited-button').click();

          await expect.poll(() => getStoredVisit(page, hash)).toBe(NEW_VISIT);
          expect(await readTooltip(page, 'last-visited-button')).not.toBe(
            previousText
          );
        });
      }
    );
  });

  /** No other tab can be active in the popup's window, so its own host stands in. */
  test('shares the timestamp across paths on the same host', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        await routeTrpcProcedure(
          context,
          'firebaseData.upsertLastVisited',
          async (call) => {
            const { hash } = z.object({ hash: z.string() }).parse(call.input);
            await succeedProcedure(call, { hash, timestamp: NEW_VISIT });
          }
        );
        await writeStorageFromWorker(
          backgroundSW,
          getRedirectionStorage([
            {
              alias: 'http://e2e-one/',
              website: getPopupUrl(extensionId),
              isDefault: false,
            },
            {
              alias: 'http://e2e-two/',
              website: `chrome-extension://${extensionId}/other-path`,
              isDefault: false,
            },
          ])
        );

        const hash = await sha256Hash(extensionId);
        const page = await openExtensionPanelPage(context, extensionId);
        await page.getByTestId('last-visited-button').click();
        await expect.poll(() => getStoredVisit(page, hash)).toBe(NEW_VISIT);

        const updatedText = await readTooltip(page, 'last-visited-button');
        expect(updatedText?.trim()).not.toBe('');

        await gotoPanel(page, 'Shortcuts');
        await new ShortcutsPanel(page).waitForLoading();

        expect(await readTooltip(page, 'rule-0-last-visited')).toBe(
          updatedText
        );
        expect(await readTooltip(page, 'rule-1-last-visited')).toBe(
          updatedText
        );
      }
    );
  });
});
