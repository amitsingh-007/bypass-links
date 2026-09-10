import {
  EStorageKey,
  getEncryptedBookmark,
  getEncryptedPerson,
  type IBookmarksObj,
  type IPersons,
  ROOT_FOLDER_ID,
} from '@bypass/shared';
import {
  clearSearchInput,
  fillSearchInput,
  injectLocalStorage,
  TEST_SITES,
} from '@bypass/shared/tests';
import { type Locator, type Page } from '@playwright/test';

import { test, expect } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../page-object-models/bookmarks-panel';
import { PersonsPanel } from '../page-object-models/persons-panel';

/** Well past what either panel viewport can hold, so a rendered subset is proof. */
const LIST_SIZE = 150;
const SEARCHED_INDEX = 75;
/** Below the `sm` badge breakpoint and the `md` grid one, so both narrow. */
const NARROW_VIEWPORT = { width: 500, height: 800 };

const padded = (index: number) => String(index).padStart(3, '0');
const bookmarkTitle = (index: number) => `Large Bookmark ${padded(index)}`;
const personName = (index: number) => `Large Person ${padded(index)}`;

const seededUrls = Array.from({ length: LIST_SIZE }, (_, index) =>
  getEncryptedBookmark({
    id: `e2e-large-bookmark-${padded(index)}`,
    url: `${TEST_SITES.EXAMPLE_COM}/large/${padded(index)}`,
    title: bookmarkTitle(index),
    taggedPersons: [],
    parentHash: ROOT_FOLDER_ID,
  })
);

/** Root holds the whole list, so `/bookmark-panel` opens on it directly. */
const seededBookmarks: IBookmarksObj = {
  folderList: {},
  urlList: Object.fromEntries(seededUrls.map((url) => [url.id, url])),
  folders: {
    [ROOT_FOLDER_ID]: seededUrls.map(({ id }) => ({ isDir: false, hash: id })),
  },
};

const seededPersons: IPersons = Object.fromEntries(
  Array.from({ length: LIST_SIZE }, (_, index) => {
    const person = getEncryptedPerson({
      uid: `e2e-large-person-${padded(index)}`,
      name: personName(index),
    });
    return [person.uid, person];
  })
);

const scrollToEnd = async (page: Page) => {
  await page
    .locator('[data-slot="scroll-area-viewport"]')
    .first()
    .evaluate((viewport) => {
      viewport.scrollTop = viewport.scrollHeight;
    });
};

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
 * Both panels virtualize through different components but make the same two
 * promises: only a slice is rendered, and a search still finds a row that was
 * never rendered. Neither web panel has the extension's scroll buttons, so the
 * scroll container is driven directly.
 */
const expectVirtualizedList = async ({
  page,
  rows,
  first,
  last,
  searchFor,
  listedNames,
}: ListUnderTest) => {
  await expect(first).toBeVisible();
  // Both halves matter: a slice rendered, and the far end genuinely absent
  expect(await rows.count()).toBeLessThan(LIST_SIZE);
  await expect(last).toHaveCount(0);

  await test.step('scrolling to the end renders the last row', async () => {
    await scrollToEnd(page);

    await expect(last).toBeVisible();
    await expect(first).toHaveCount(0);
  });

  await test.step('searching after scrolling finds a row that was never rendered', async () => {
    await fillSearchInput(page, searchFor);

    await expect.poll(listedNames).toEqual([searchFor]);
  });
};

/**
 * Seeded straight into local storage on an empty state: the panels read nothing
 * else, so this needs neither the account's data nor a session.
 */
test.describe('Large web lists', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ context }) => {
    await injectLocalStorage(context, {
      [EStorageKey.bookmarks]: JSON.stringify(seededBookmarks),
      [EStorageKey.persons]: JSON.stringify(seededPersons),
    });
  });

  test('scrolls and searches a large bookmark listing', async ({ page }) => {
    await page.goto('/bookmark-panel');
    const panel = new BookmarksPanel(page);
    await expect.poll(() => panel.getBadgeCount()).toBe(LIST_SIZE);

    await expectVirtualizedList({
      page,
      rows: panel.getBookmarkItems(),
      first: panel.getBookmarkElement(bookmarkTitle(0)),
      last: panel.getBookmarkElement(bookmarkTitle(LIST_SIZE - 1)),
      searchFor: bookmarkTitle(SEARCHED_INDEX),
      listedNames: async () => panel.getBookmarkTitles(),
    });
  });

  test('scrolls and searches a large persons grid', async ({ page }) => {
    await page.goto('/persons-panel');
    const panel = new PersonsPanel(page);
    await expect.poll(() => panel.getHeaderPersonCount()).toBe(LIST_SIZE);

    await expectVirtualizedList({
      page,
      rows: panel.getPersonItems(),
      first: panel.getPersonCardElement(personName(0)),
      last: panel.getPersonCardElement(personName(LIST_SIZE - 1)),
      searchFor: personName(SEARCHED_INDEX),
      listedNames: async () => panel.getPersonNames(),
    });
  });

  test.describe('on a narrow viewport', () => {
    test.use({ viewport: NARROW_VIEWPORT });

    test('lays the persons grid out in three columns and still searches it', async ({
      page,
    }) => {
      await page.goto('/persons-panel');
      const panel = new PersonsPanel(page);
      const countColumns = async () =>
        new Set(
          await panel
            .getPersonItems()
            .evaluateAll((cards) =>
              cards.map((card) => Math.round(card.getBoundingClientRect().x))
            )
        ).size;

      await expect.poll(countColumns).toBe(3);

      await fillSearchInput(page, personName(SEARCHED_INDEX));

      await expect
        .poll(() => panel.getPersonNames())
        .toEqual([personName(SEARCHED_INDEX)]);
    });

    test('drops the bookmark header badge and links the titles instead', async ({
      page,
    }) => {
      await page.goto('/bookmark-panel');
      const panel = new BookmarksPanel(page);
      const firstTitle = bookmarkTitle(0);

      await expect(panel.getBookmarkElement(firstTitle)).toBeVisible();
      await expect(panel.getBookmarkCountBadge()).toBeHidden();

      // Below `md` the title becomes a real link, so a tap opens the bookmark
      await expect(
        panel.getBookmarkElement(firstTitle).getByRole('link', {
          name: firstTitle,
        })
      ).toHaveAttribute('href', `${TEST_SITES.EXAMPLE_COM}/large/${padded(0)}`);

      await test.step('the narrow header still searches', async () => {
        await fillSearchInput(page, bookmarkTitle(SEARCHED_INDEX));
        await expect
          .poll(() => panel.getBookmarkTitles())
          .toEqual([bookmarkTitle(SEARCHED_INDEX)]);

        await clearSearchInput(page);
        await expect(panel.getBookmarkElement(firstTitle)).toBeVisible();
      });
    });
  });
});
