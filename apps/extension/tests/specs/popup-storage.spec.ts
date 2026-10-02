import { expect, test, type Page } from '@playwright/test';

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
import { withSignedInProfile } from '../utils/signed-in-profile';
import { getStorageItem } from '../utils/test-utils';

const STATE_KEY = EExtStorageKey.EXT_STATE;
const HISTORY_KEY = EExtStorageKey.HISTORY_START_TIME;

interface PopupStorageProbe {
  heldKeys: string[];
  heldReads: Record<string, (() => void)[]>;
  returned: Record<string, number>;
  deletedRanges: { startTime: number; endTime: number }[];
  releaseDelete?: () => void;
  deleteFinished: boolean;
}

declare global {
  interface Window {
    e2ePopupStorage: PopupStorageProbe;
  }
}

const holdPopupReads = async (
  page: Page,
  keys: string[],
  holdHistoryDeletion = false
) => {
  await page.addInitScript(
    ({ heldKeys, holdDeletion }) => {
      const probe: PopupStorageProbe = {
        heldKeys,
        heldReads: {},
        returned: {},
        deletedRanges: [],
        deleteFinished: false,
      };
      window.e2ePopupStorage = probe;
      const get = chrome.storage.local.get.bind(chrome.storage.local);
      Object.defineProperty(chrome.storage.local, 'get', {
        value: async (
          storageKeys: string | string[] | Record<string, unknown> | null = null
        ) => {
          const values = await get<Record<string, unknown>>(storageKeys);
          if (typeof storageKeys === 'string') {
            if (probe.heldKeys.includes(storageKeys)) {
              await new Promise<void>((resolve) => {
                (probe.heldReads[storageKeys] ??= []).push(resolve);
              });
            }
            probe.returned[storageKeys] =
              (probe.returned[storageKeys] ?? 0) + 1;
          }
          return values;
        },
      });
      const deleteRange = chrome.history.deleteRange.bind(chrome.history);
      Object.defineProperty(chrome.history, 'deleteRange', {
        value: async (range: { startTime: number; endTime: number }) => {
          probe.deletedRanges.push(range);
          if (holdDeletion) {
            await new Promise<void>((resolve) => {
              probe.releaseDelete = resolve;
            });
          }
          await deleteRange(range);
          probe.deleteFinished = true;
        },
      });
    },
    { heldKeys: keys, holdDeletion: holdHistoryDeletion }
  );
  return {
    waitUntilHeld: async (key: string) =>
      expect
        .poll(() =>
          page.evaluate(
            (storageKey) =>
              window.e2ePopupStorage.heldReads[storageKey]?.length ?? 0,
            key
          )
        )
        .toBeGreaterThan(0),
    allowNewReads: async (key: string) =>
      page.evaluate((storageKey) => {
        const probe = window.e2ePopupStorage;
        probe.heldKeys = probe.heldKeys.filter((held) => held !== storageKey);
      }, key),
    release: async (key: string) => {
      const expectedReturns = await page.evaluate((storageKey) => {
        const probe = window.e2ePopupStorage;
        probe.heldKeys = probe.heldKeys.filter((held) => held !== storageKey);
        const held = probe.heldReads[storageKey] ?? [];
        const expected = (probe.returned[storageKey] ?? 0) + held.length;
        held.forEach((resolve) => resolve());
        probe.heldReads[storageKey] = [];
        return expected;
      }, key);
      await expect
        .poll(() =>
          page.evaluate(
            (storageKey) => window.e2ePopupStorage.returned[storageKey] ?? 0,
            key
          )
        )
        .toBeGreaterThanOrEqual(expectedReturns);
      await page.evaluate(async () => chrome.runtime.getPlatformInfo());
    },
  };
};

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

  test('keeps the active loading fallback and newer events over old reads', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        const startTime = Date.now() - 30_000;
        await writeStorageFromWorker(backgroundSW, {
          [STATE_KEY]: EExtensionState.INACTIVE,
          [HISTORY_KEY]: startTime,
        });
        const page = await context.newPage();
        const reads = await holdPopupReads(page, [STATE_KEY, HISTORY_KEY]);
        await page.goto(getPopupUrl(extensionId));
        await reads.waitUntilHeld(STATE_KEY);
        await reads.waitUntilHeld(HISTORY_KEY);
        await expect(page.getByTestId('logout-button')).toBeEnabled();
        await expect(page.getByTestId('toggle-extension-switch')).toBeChecked();
        await expect(
          page.getByTestId('toggle-history-switch')
        ).not.toBeChecked();

        await writeStorageFromWorker(backgroundSW, {
          [STATE_KEY]: EExtensionState.ACTIVE,
          [HISTORY_KEY]: startTime + 1000,
        });
        await expect(page.getByTestId('toggle-history-switch')).toBeChecked();
        await removeStorageFromWorker(backgroundSW, HISTORY_KEY);
        await expect(
          page.getByTestId('toggle-history-switch')
        ).not.toBeChecked();
        await reads.release(STATE_KEY);
        await reads.release(HISTORY_KEY);

        await expect(page.getByTestId('logout-button')).toBeEnabled();
        await expect(page.getByTestId('toggle-extension-switch')).toBeChecked();
        await expect(
          page.getByTestId('toggle-history-switch')
        ).not.toBeChecked();
        expect(await getStorageItem(page, HISTORY_KEY)).toBeUndefined();
      }
    );
  });

  test('ignores an old history read after leaving and reopening home', async () => {
    await withSignedInProfile(
      async ({ context, extensionId, backgroundSW }) => {
        await writeStorageFromWorker(backgroundSW, {
          [STATE_KEY]: EExtensionState.ACTIVE,
          [HISTORY_KEY]: Date.now() - 30_000,
        });
        const page = await context.newPage();
        const reads = await holdPopupReads(page, [HISTORY_KEY]);
        await page.goto(getPopupUrl(extensionId));
        await reads.waitUntilHeld(HISTORY_KEY);
        await page
          .getByRole('button', { name: 'Bookmarks', exact: true })
          .click();
        await expect(page.getByPlaceholder('Search')).toBeVisible();
        await reads.allowNewReads(HISTORY_KEY);
        await removeStorageFromWorker(backgroundSW, HISTORY_KEY);
        await page.getByRole('button', { name: 'Back', exact: true }).click();
        await expect(page.getByTestId('logout-button')).toBeVisible();
        await expect
          .poll(() =>
            page.evaluate(
              (key) => window.e2ePopupStorage.returned[key] ?? 0,
              HISTORY_KEY
            )
          )
          .toBeGreaterThan(0);
        await reads.release(HISTORY_KEY);
        await expect(
          page.getByTestId('toggle-history-switch')
        ).not.toBeChecked();
      }
    );
  });

  for (const firstKey of [STATE_KEY, HISTORY_KEY]) {
    test(`cleans persisted inactive history when ${firstKey} loads first`, async () => {
      await withTempProfileContext({}, async (context) => {
        const backgroundSW = await createSharedBackgroundSW(context);
        const extensionId = await getExtensionId(backgroundSW);
        const startTime = Date.now() - 30_000;
        const visit = 'https://history-cleanup.test/';
        await writeStorageFromWorker(backgroundSW, {
          [STATE_KEY]: EExtensionState.INACTIVE,
          [HISTORY_KEY]: startTime,
        });
        await backgroundSW.evaluate(
          async (url) => chrome.history.addUrl({ url }),
          visit
        );
        const page = await context.newPage();
        const reads = await holdPopupReads(
          page,
          [STATE_KEY, HISTORY_KEY],
          true
        );
        await page.goto(getPopupUrl(extensionId));
        await reads.waitUntilHeld(STATE_KEY);
        await reads.waitUntilHeld(HISTORY_KEY);
        await reads.release(firstKey);
        if (firstKey === STATE_KEY) {
          await expect(
            page.getByTestId('toggle-history-switch')
          ).toBeDisabled();
        } else {
          await expect(page.getByTestId('toggle-history-switch')).toBeChecked();
        }
        expect(
          await page.evaluate(() => window.e2ePopupStorage.deletedRanges)
        ).toEqual([]);
        await reads.release(firstKey === STATE_KEY ? HISTORY_KEY : STATE_KEY);

        await expect
          .poll(() =>
            page.evaluate(() => window.e2ePopupStorage.deletedRanges.length)
          )
          .toBe(1);
        expect(await getStorageItem(page, HISTORY_KEY)).toBe(startTime);
        await expect(page.getByTestId('toggle-history-switch')).toBeChecked();
        await page.evaluate(() => window.e2ePopupStorage.releaseDelete?.());
        await expect
          .poll(() => getStorageItem(page, HISTORY_KEY))
          .toBeUndefined();
        await expect(
          page.getByTestId('toggle-history-switch')
        ).not.toBeChecked();
        expect(
          await page.evaluate(() => window.e2ePopupStorage.deleteFinished)
        ).toBe(true);
        const [range] = await page.evaluate(
          () => window.e2ePopupStorage.deletedRanges
        );
        expect(range.startTime).toBe(startTime);
        expect(range.endTime).toBeGreaterThanOrEqual(startTime + 30_000);
        expect(
          await backgroundSW.evaluate(
            async (url) => chrome.history.search({ text: url, startTime: 0 }),
            visit
          )
        ).toEqual([]);
      });
    });
  }
});
