import {
  EStorageKey,
  getEncryptedBookmark,
  getEncryptedFolder,
  getEncryptedPerson,
  type IBookmarksObj,
  type IPersons,
  type IRedirections,
  ROOT_FOLDER_ID,
} from '@bypass/shared';
import { expect, type Page } from '@playwright/test';

import { POPUP_HOMEPAGE } from '@/constants';

export const openPanel = async (
  page: Page,
  panelName: 'Bookmarks' | 'Persons' | 'Shortcuts'
) => {
  const panelButton = page.getByRole('button', { name: panelName });
  await expect(panelButton).toBeVisible();
  await panelButton.click();
  await expect(page.getByPlaceholder('Search')).toBeVisible();
};

export const gotoPanel = async (
  page: Page,
  panelName: 'Bookmarks' | 'Persons' | 'Shortcuts'
) => {
  await page.goto(POPUP_HOMEPAGE, { waitUntil: 'domcontentloaded' });
  await openPanel(page, panelName);
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

/** Only place the pre-redirect url and the active flag are observable; headless reports background tabs as visible. */
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
  taggedPersons?: string[];
}

/** The panel can only add via the quick-bookmark deep link; reseeding a name replaces the folder. */
export const seedFolderWithBookmarks = async (
  page: Page,
  folderName: string,
  bookmarks: readonly SeedBookmark[],
  isDefault = false
) => {
  const folder = getEncryptedFolder({
    id: crypto.randomUUID(),
    name: folderName,
    parentHash: ROOT_FOLDER_ID,
    isDefault,
  });
  const urls = bookmarks.map(({ title, url, taggedPersons = [] }) =>
    getEncryptedBookmark({
      id: crypto.randomUUID(),
      url,
      title,
      taggedPersons,
      parentHash: folder.id,
    })
  );

  await page.evaluate(
    async ({ storageKey, rootId, seededFolder, seededUrls, isSoleDefault }) => {
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
      const keptFolders = keep(stored.folderList);
      if (isSoleDefault) {
        Object.values(keptFolders).forEach((keptFolder) => {
          keptFolder.isDefault = false;
        });
      }

      await chrome.storage.local.set({
        [storageKey]: {
          folderList: {
            ...keptFolders,
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
      isSoleDefault: isDefault,
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

export const getRedirectionStorage = (rules: IRedirections) => {
  const encoded = encodeRedirections(rules);
  return {
    [EStorageKey.redirections]: encoded,
    [EStorageKey.mappedRedirections]: Object.fromEntries(
      encoded.map(({ alias, website }) => [alias, website])
    ),
  };
};

export const seedPersons = async (page: Page, names: readonly string[]) => {
  const persons = names.map((name) =>
    getEncryptedPerson({ uid: crypto.randomUUID(), name })
  );

  await page.evaluate(
    async ({ storageKey, seeded }) => {
      await chrome.storage.local.set({
        [storageKey]: Object.fromEntries(
          seeded.map((person) => [person.uid, person])
        ),
      });
    },
    { storageKey: EStorageKey.persons, seeded: persons }
  );

  return persons.map(({ uid }) => uid);
};

export const getPersonUids = async (
  page: Page
): Promise<Record<string, string>> => {
  const persons =
    (await getStorageItem<IPersons>(page, EStorageKey.persons)) ?? {};
  return Object.fromEntries(
    Object.values(persons).map(({ uid, name }) => [atob(name), uid])
  );
};
