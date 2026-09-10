import { TEST_SITES, fillSearchInput } from '@bypass/shared/tests';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { openExtensionPanelPage } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';
import { withSignedInProfile } from '../utils/signed-in-profile';
import { seedFolderWithBookmarks, seedPersons } from '../utils/test-utils';

/** Well past what any panel viewport can hold, so a rendered subset is proof. */
const LIST_SIZE = 150;
const LARGE_FOLDER = 'E2E Large Folder';

const padded = (index: number) => String(index).padStart(3, '0');

const bookmarkTitle = (index: number) => `Large Bookmark ${padded(index)}`;
const personName = (index: number) => `Large Person ${padded(index)}`;

const seededBookmarks = Array.from({ length: LIST_SIZE }, (_, index) => ({
  title: bookmarkTitle(index),
  url: `${TEST_SITES.EXAMPLE_COM}/large/${padded(index)}`,
}));
const seededPersonNames = Array.from({ length: LIST_SIZE }, (_, index) =>
  personName(index)
);

const scrollToBottom = async (page: Page) =>
  page.getByTestId('scroll-to-bottom').click();

const scrollToTop = async (page: Page) =>
  page.getByTestId('scroll-to-top').click();

/**
 * Virtualization is only proven by both halves: a rendered count below the
 * seeded total, and the row at the far end genuinely absent from the DOM.
 */
const expectVirtualized = async (rows: Locator, lastRow: Locator) => {
  await expect.poll(async () => rows.count()).toBeGreaterThan(0);
  expect(await rows.count()).toBeLessThan(LIST_SIZE);
  await expect(lastRow).toHaveCount(0);
};

test.describe('Large virtualized lists', () => {
  test('scrolls and searches a large bookmark folder', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(
        context,
        extensionId,
        'bookmarks'
      );
      const panel = new BookmarksPanel(page);
      await seedFolderWithBookmarks(page, LARGE_FOLDER, seededBookmarks);
      await panel.ensureAtRoot();

      // Not `openFolder`: it asserts the folder's whole listing, which is the
      // one thing a virtualized folder never renders
      await panel.getFolderElement(LARGE_FOLDER).dblclick();
      const firstBookmark = panel.getBookmarkElement(bookmarkTitle(0));
      const lastBookmark = panel.getBookmarkElement(
        bookmarkTitle(LIST_SIZE - 1)
      );
      await expect(firstBookmark).toBeVisible();

      await expectVirtualized(panel.getBookmarkItems(), lastBookmark);

      await test.step('the bottom control reaches the last bookmark', async () => {
        await scrollToBottom(page);

        await expect(lastBookmark).toBeVisible();
        await expect(firstBookmark).toHaveCount(0);
      });

      await test.step('the top control comes back to the first', async () => {
        await scrollToTop(page);

        await expect(firstBookmark).toBeVisible();
      });

      await test.step('searching after scrolling finds a row that was never rendered', async () => {
        await scrollToBottom(page);
        await fillSearchInput(page, bookmarkTitle(75));

        await expect
          .poll(async () => panel.getBookmarkTitles())
          .toEqual([bookmarkTitle(75)]);
      });
    });
  });

  test('scrolls and searches a large persons list', async () => {
    await withSignedInProfile(async ({ context, extensionId }) => {
      const page = await openExtensionPanelPage(
        context,
        extensionId,
        'persons'
      );
      const panel = new PersonsPanel(page);
      await seedPersons(page, seededPersonNames);
      await panel.ensureAtRoot();

      const firstPerson = panel.getPersonCardElement(personName(0));
      const lastPerson = panel.getPersonCardElement(personName(LIST_SIZE - 1));
      await expect(firstPerson).toBeVisible();
      expect(await panel.getHeaderPersonCount()).toBe(LIST_SIZE);

      await expectVirtualized(panel.getPersonItems(), lastPerson);

      await test.step('the bottom control reaches the last person', async () => {
        await scrollToBottom(page);

        await expect(lastPerson).toBeVisible();
        await expect(firstPerson).toHaveCount(0);
      });

      await test.step('the top control comes back to the first', async () => {
        await scrollToTop(page);

        await expect(firstPerson).toBeVisible();
      });

      await test.step('searching after scrolling finds a person that was never rendered', async () => {
        await scrollToBottom(page);
        await fillSearchInput(page, personName(75));

        await expect
          .poll(async () => panel.getPersonNames())
          .toEqual([personName(75)]);
      });
    });
  });
});
