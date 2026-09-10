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
  expectVirtualizedList,
  fillSearchInput,
  injectLocalStorage,
  TEST_LARGE_LIST,
} from '@bypass/shared/tests';
import { type Page } from '@playwright/test';

import { test, expect } from '../fixtures/base-fixture';
import { BookmarksPanel } from '../page-object-models/bookmarks-panel';
import { PersonsPanel } from '../page-object-models/persons-panel';

const { SIZE, SEARCHED_INDEX, bookmarkTitle, bookmarkUrl, personName } =
  TEST_LARGE_LIST;

/** Below the `sm` badge breakpoint and the `md` grid one, so both narrow. */
const NARROW_VIEWPORT = { width: 500, height: 800 };

const seededUrls = Array.from({ length: SIZE }, (_, index) =>
  getEncryptedBookmark({
    id: `e2e-large-bookmark-${index}`,
    url: bookmarkUrl(index),
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
  Array.from({ length: SIZE }, (_, index) => {
    const person = getEncryptedPerson({
      uid: `e2e-large-person-${index}`,
      name: personName(index),
    });
    return [person.uid, person];
  })
);

/** Neither web panel has the extension's scroll buttons. */
const scrollToEnd = async (page: Page) => {
  await page
    .locator('[data-slot="scroll-area-viewport"]')
    .first()
    .evaluate((viewport) => {
      viewport.scrollTop = viewport.scrollHeight;
    });
};

/** Seeded into local storage: needs neither account data nor a session. */
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
    await expect.poll(() => panel.getBadgeCount()).toBe(SIZE);

    await expectVirtualizedList({
      page,
      rows: panel.getBookmarkItems(),
      first: panel.getBookmarkElement(bookmarkTitle(0)),
      last: panel.getBookmarkElement(bookmarkTitle(SIZE - 1)),
      searchFor: bookmarkTitle(SEARCHED_INDEX),
      listedNames: async () => panel.getBookmarkTitles(),
      scrollToEnd: async () => scrollToEnd(page),
    });
  });

  test('scrolls and searches a large persons grid', async ({ page }) => {
    await page.goto('/persons-panel');
    const panel = new PersonsPanel(page);
    await expect.poll(() => panel.getHeaderPersonCount()).toBe(SIZE);

    await expectVirtualizedList({
      page,
      rows: panel.getPersonItems(),
      first: panel.getPersonCardElement(personName(0)),
      last: panel.getPersonCardElement(personName(SIZE - 1)),
      searchFor: personName(SEARCHED_INDEX),
      listedNames: async () => panel.getPersonNames(),
      scrollToEnd: async () => scrollToEnd(page),
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
      ).toHaveAttribute('href', bookmarkUrl(0));

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
