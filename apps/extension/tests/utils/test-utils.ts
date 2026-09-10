import {
  EStorageKey,
  getEncryptedBookmark,
  getEncryptedFolder,
  type IBookmarksObj,
  type IRedirections,
  ROOT_FOLDER_ID,
} from '@bypass/shared';
import { expect, type Page } from '@playwright/test';

import { POPUP_HOMEPAGE } from '@/constants';

export const gotoPanel = async (
  page: Page,
  panelName: 'Bookmarks' | 'Persons' | 'Shortcuts'
) => {
  await page.goto(POPUP_HOMEPAGE);
  const panelButton = page.getByRole('button', { name: panelName });
  await expect(panelButton).toBeVisible();
  await panelButton.click();
  await expect(page.getByPlaceholder('Search')).toBeVisible();
};

export const navigateBack = async (page: Page) => {
  const backButton = page
    .locator('[aria-label="back"]')
    .or(page.getByRole('button', { name: /back/i }))
    .filter({ visible: true })
    .first();
  await backButton.click({ force: true });
};

export const openAddDialog = async (page: Page, dialogName: string) => {
  const addButton = page.getByRole('button', { name: 'Add', exact: true });
  await addButton.click();

  const dialog = page.getByRole('dialog', { name: dialogName });
  await expect(dialog).toBeVisible();

  return dialog;
};

export const fillDialogInput = async (
  dialog: ReturnType<Page['getByRole']>,
  placeholder: string,
  value: string
) => {
  const input = dialog.getByPlaceholder(placeholder);
  await input.fill(value);
};

export const clickDialogButton = async (
  dialog: ReturnType<Page['getByRole']>,
  name: string
) => {
  const button = dialog.getByRole('button', { name });
  await button.click();
};

export const clickContextMenuItem = async (page: Page, id: string) => {
  const menuItem = page.getByTestId(`context-menu-item-${id}`);
  await expect(menuItem).toBeVisible();
  await menuItem.click();
};

interface CreatedTab {
  url: string;
  active: boolean;
}

declare global {
  interface Window {
    e2eCreatedTabs?: CreatedTab[];
    e2eCreatedTabsAttached?: boolean;
  }
}

/**
 * Arms a `tabs.onCreated` recorder on `page`, resetting anything a previous
 * call collected. Tabs the extension opens through `chrome.tabs.create` are not
 * routable by Playwright and both fixture bookmarks 301, so the requested url
 * is only observable here, before the redirect rewrites it. Headless Chromium
 * also reports background tabs as `document.visibilityState === 'visible'`, so
 * the recorded `active` flag is the only proof `active: false` reached Chrome.
 */
export const recordCreatedTabs = async (page: Page) => {
  await page.evaluate(() => {
    window.e2eCreatedTabs = [];
    if (window.e2eCreatedTabsAttached) {
      return;
    }
    window.e2eCreatedTabsAttached = true;
    chrome.tabs.onCreated.addListener((tab) => {
      window.e2eCreatedTabs?.push({
        url: tab.pendingUrl ?? tab.url ?? '',
        active: tab.active,
      });
    });
  });
};

export const getRecordedTabs = async (page: Page) =>
  page.evaluate(() => window.e2eCreatedTabs ?? []);

export const getStorageItem = async <T = unknown>(
  page: Page,
  key: string
): Promise<T | undefined> => {
  return page.evaluate(async (storageKey) => {
    const result = await chrome.storage.local.get([storageKey]);
    return result[storageKey] as T;
  }, key);
};

interface SeedBookmark {
  title: string;
  url: string;
}

/**
 * Seeds a root folder and the bookmarks it holds straight into storage: the
 * panel can only create a bookmark through the quick-bookmark deep link, which
 * is limited to the active tab's url. Reseeding the same name replaces the
 * previous folder, so a repeated run cannot leave two rows to pick between.
 */
export const seedFolderWithBookmarks = async (
  page: Page,
  folderName: string,
  bookmarks: readonly SeedBookmark[]
) => {
  const folder = getEncryptedFolder({
    id: crypto.randomUUID(),
    name: folderName,
    parentHash: ROOT_FOLDER_ID,
    isDefault: false,
  });
  const urls = bookmarks.map(({ title, url }) =>
    getEncryptedBookmark({
      id: crypto.randomUUID(),
      url,
      title,
      taggedPersons: [],
      parentHash: folder.id,
    })
  );

  await page.evaluate(
    async ({ storageKey, rootId, seededFolder, seededUrls }) => {
      const stored = (await chrome.storage.local.get(storageKey))[
        storageKey
      ] as IBookmarksObj;
      const staleIds = new Set(
        Object.entries(stored.folderList)
          .filter(([, stale]) => stale.name === seededFolder.name)
          .map(([id]) => id)
      );
      const isStale = (id: string) =>
        staleIds.has(id) || staleIds.has(stored.urlList[id]?.parentHash);
      const keep = <T>(record: Record<string, T>) =>
        Object.fromEntries(
          Object.entries(record).filter(([id]) => !isStale(id))
        );

      await chrome.storage.local.set({
        [storageKey]: {
          folderList: {
            ...keep(stored.folderList),
            [seededFolder.id]: seededFolder,
          },
          urlList: {
            ...keep(stored.urlList),
            ...Object.fromEntries(seededUrls.map((url) => [url.id, url])),
          },
          folders: {
            ...keep(stored.folders),
            [rootId]: [
              { isDir: true, hash: seededFolder.id },
              ...(stored.folders[rootId] ?? []).filter(
                ({ hash }) => !staleIds.has(hash)
              ),
            ],
            [seededFolder.id]: seededUrls.map(({ id }) => ({
              isDir: false,
              hash: id,
            })),
          },
        } satisfies IBookmarksObj,
      });
    },
    {
      storageKey: EStorageKey.bookmarks,
      rootId: ROOT_FOLDER_ID,
      seededFolder: folder,
      seededUrls: urls,
    }
  );

  return { folderId: folder.id, bookmarkIds: urls.map(({ id }) => id) };
};

/** Rules are held base64 encoded, both in storage and over the wire. */
export const encodeRedirections = (rules: IRedirections) =>
  rules.map(({ alias, website, isDefault }) => ({
    alias: btoa(alias),
    website: btoa(website),
    isDefault,
  }));

/** Rules as storage holds them, plus the map the redirect path looks up. */
export const getRedirectionStorage = (rules: IRedirections) => {
  const encoded = encodeRedirections(rules);
  return {
    [EStorageKey.redirections]: encoded,
    [EStorageKey.mappedRedirections]: Object.fromEntries(
      encoded.map(({ alias, website }) => [alias, website])
    ),
  };
};
