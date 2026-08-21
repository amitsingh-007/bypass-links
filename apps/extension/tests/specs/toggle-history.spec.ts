import {
  TEST_SITES,
  TEST_BOOKMARKS,
  openNewPageFromAction,
} from '@bypass/shared/tests';

import { test, expect } from '../fixtures/home-popup-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { getHistoryItems } from '../utils/history-utils';
import { PopupHomePanel } from '../utils/home-panel';

test.describe('History Tracking Workflow', () => {
  test.describe.configure({ mode: 'parallel' });
  test('should turn on history tracking', async ({ homePage }) => {
    const homePanel = new PopupHomePanel(homePage);

    await homePanel.setHistoryEnabled(false);

    await expect(homePanel.historyToggle).not.toBeChecked();

    await homePanel.setHistoryEnabled(true);

    await expect(homePanel.historyToggle).toBeChecked();

    await homePanel.verifyHistoryStartTime();
  });

  test('should visit test sites and delete tracked history when turned off', async ({
    homePage,
    context,
  }) => {
    const homePanel = new PopupHomePanel(homePage);
    const sites = [
      TEST_SITES.EXAMPLE_COM,
      TEST_SITES.EXAMPLE_ORG,
      TEST_SITES.EXAMPLE_NET,
    ];

    await test.step('enable tracking', async () => {
      await homePanel.setHistoryEnabled(true);
      await expect(homePanel.historyToggle).toBeChecked();
    });

    await test.step('visits land in history', async () => {
      for (const site of sites) {
        const newPage = await context.newPage();
        await newPage.goto(site, { waitUntil: 'domcontentloaded' });
        await newPage.close();
      }

      // Chrome commits visits asynchronously, so the same poll the deletion step needs
      await expect
        .poll(
          async () => {
            const visited = await getHistoryItems(homePage, sites);
            return sites.filter((site) =>
              visited.some((item) => item.url?.includes(site))
            );
          },
          {
            message: 'Every visited site should be tracked',
            timeout: 15_000,
          }
        )
        .toEqual(sites);
    });

    await test.step('disable tracking', async () => {
      await homePanel.setHistoryEnabled(false);
      await expect(homePanel.historyToggle).not.toBeChecked();
      await homePanel.verifyHistoryStartTimeNotExists();
    });

    await test.step('tracked history is deleted', async () => {
      await expect
        .poll(
          async () => {
            const historyAfter = await getHistoryItems(homePage, sites);
            return historyAfter.length;
          },
          {
            message: 'History items should be deleted',
            timeout: 15_000,
          }
        )
        .toBe(0);
    });
  });

  test('should turn on history tracking when a bookmark is opened', async ({
    homePage,
    context,
  }) => {
    const homePanel = new PopupHomePanel(homePage);

    await homePanel.setHistoryEnabled(false);
    await expect(homePanel.historyToggle).not.toBeChecked();

    await homePanel.navigateToBookmarks();

    const panel = new BookmarksPanel(homePage);

    const newPage = await openNewPageFromAction(context, async () => {
      await panel.openBookmarkByDoubleClick(TEST_BOOKMARKS.REACT_DOCS);
    });
    await newPage.close();

    await panel.navigateBack();

    await expect(homePanel.historyToggle).toBeChecked();

    await homePanel.verifyHistoryStartTime();
  });
});
