import { TEST_SITES, TEST_TIMEOUTS } from '@bypass/shared/tests';
import { type Page } from '@playwright/test';

import { EExtStorageKey } from '@/constants';

import { expect, test } from '../fixtures/background-fixture';
import { getHistoryItems } from '../utils/history-utils';
import { PopupHomePanel } from '../utils/home-panel';

/** Chrome commits visits asynchronously, so every check on them has to poll. */
const hasVisit = async (page: Page, site: string) =>
  (await getHistoryItems(page, [site])).length > 0;

const visit = async (
  openLoadedTab: (url: string) => Promise<Page>,
  site: string
) => {
  const page = await openLoadedTab(site);
  await page.close();
};

test('keeps tracking across a popup reopen and clears only the tracked window', async ({
  isolatedBackground,
}) => {
  await visit(isolatedBackground.openLoadedTab, TEST_SITES.EXAMPLE_ORG);
  const popup = await isolatedBackground.openPopup();
  await expect
    .poll(() => hasVisit(popup, TEST_SITES.EXAMPLE_ORG), {
      timeout: TEST_TIMEOUTS.PAGE_OPEN,
    })
    .toBe(true);

  // Tracking starts after that visit, so only later ones fall inside the window
  await isolatedBackground.setHistoryStartTime(Date.now());
  await popup.close();

  const reopened = await isolatedBackground.openPopup();
  const homePanel = new PopupHomePanel(reopened);
  await expect(homePanel.historyToggle).toBeChecked();

  await visit(isolatedBackground.openLoadedTab, TEST_SITES.EXAMPLE_COM);
  await expect
    .poll(() => hasVisit(reopened, TEST_SITES.EXAMPLE_COM), {
      timeout: TEST_TIMEOUTS.PAGE_OPEN,
    })
    .toBe(true);

  await homePanel.setHistoryEnabled(false);

  await expect
    .poll(() => hasVisit(reopened, TEST_SITES.EXAMPLE_COM), {
      timeout: TEST_TIMEOUTS.PAGE_OPEN,
    })
    .toBe(false);
  expect(await hasVisit(reopened, TEST_SITES.EXAMPLE_ORG)).toBe(true);
  await homePanel.verifyHistoryStartTimeNotExists();
});

test('switching the extension off clears the tracked interval', async ({
  isolatedBackground,
}) => {
  await isolatedBackground.setHistoryStartTime(Date.now());
  const popup = await isolatedBackground.openPopup();
  const homePanel = new PopupHomePanel(popup);
  await expect(homePanel.historyToggle).toBeChecked();

  await popup.getByTestId('toggle-extension-switch').click();

  await expect
    .poll(async () =>
      isolatedBackground.readStorage(EExtStorageKey.HISTORY_START_TIME)
    )
    .toBeUndefined();
  await expect(homePanel.historyToggle).not.toBeChecked();
  await expect(homePanel.historyToggle).toBeDisabled();
});
