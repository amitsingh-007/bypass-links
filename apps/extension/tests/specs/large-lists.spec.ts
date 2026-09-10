import { TEST_SITES, fillSearchInput } from '@bypass/shared/tests';
import { expect, test, type Locator, type Page } from '@playwright/test';

import { openExtensionPanelPage } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../utils/bookmarks-panel';
import { PersonsPanel } from '../utils/persons-panel';
import { withSignedInProfile } from '../utils/signed-in-profile';
import { seedFolderWithBookmarks, seedPersons } from '../utils/test-utils';

/** Well past what any panel viewport can hold, so a rendered subset is proof. */
const LIST_SIZE = 150;
const SEARCHED_INDEX = 75;
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

interface ListUnderTest {
  page: Page;
  /** Every row the panel currently has in the DOM. */
  rows: Locator;
  first: Locator;
  last: Locator;
  searchFor: string;
  /** What the panel reports it is listing, so the filtered result is exact. */
  listedNames: () => Promise<string[]>;
}

/**
 * The two panels virtualize through different components but expose the same
 * three promises: only a slice is rendered, the controls reach either end, and
 * a search still finds a row that was never rendered.
 */
const expectVirtualizedList = async ({
  page,
  rows,
  first,
  last,
  searchFor,
  listedNames,
}: ListUnderTest) => {
  const scrollToTop = async () => page.getByTestId('scroll-to-top').click();
  const scrollToBottom = async () =>
    page.getByTestId('scroll-to-bottom').click();

  await expect(first).toBeVisible();
  // Both halves matter: a slice rendered, and the far end genuinely absent
  expect(await rows.count()).toBeLessThan(LIST_SIZE);
  await expect(last).toHaveCount(0);

  await test.step('the bottom control reaches the last row', async () => {
    await scrollToBottom();

    await expect(last).toBeVisible();
    await expect(first).toHaveCount(0);
  });

  await test.step('the top control comes back to the first', async () => {
    await scrollToTop();

    await expect(first).toBeVisible();
  });

  await test.step('searching after scrolling finds a row that was never rendered', async () => {
    await scrollToBottom();
    await fillSearchInput(page, searchFor);

    await expect.poll(listedNames).toEqual([searchFor]);
  });
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

      await expectVirtualizedList({
        page,
        rows: panel.getBookmarkItems(),
        first: panel.getBookmarkElement(bookmarkTitle(0)),
        last: panel.getBookmarkElement(bookmarkTitle(LIST_SIZE - 1)),
        searchFor: bookmarkTitle(SEARCHED_INDEX),
        listedNames: async () => panel.getBookmarkTitles(),
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
      expect(await panel.getHeaderPersonCount()).toBe(LIST_SIZE);

      await expectVirtualizedList({
        page,
        rows: panel.getPersonItems(),
        first: panel.getPersonCardElement(personName(0)),
        last: panel.getPersonCardElement(personName(LIST_SIZE - 1)),
        searchFor: personName(SEARCHED_INDEX),
        listedNames: async () => panel.getPersonNames(),
      });
    });
  });
});
