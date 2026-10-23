import {
  type IBookmarksObj,
  type ILastVisited,
  type IPersons,
  type IRedirection,
  type IRedirections,
  type IWebsites,
  EStorageKey,
  decodeText,
  encodeText,
} from '@bypass/shared/server';

import {
  getFromFirebase,
  saveToFirebase,
  upsertToFirebase,
} from '../firebaseAdminService';

// zod/mini: z.object and z.array reject {}, z.record accepts {} but rejects null
const EMPTY_BOOKMARKS: IBookmarksObj = {
  folderList: {},
  urlList: {},
  folders: {},
};

export const getBookmarks = (uid: string) =>
  getFromFirebase({
    ref: EStorageKey.bookmarks,
    uid,
    fallback: EMPTY_BOOKMARKS,
  });

export const getPersons = (uid: string) =>
  getFromFirebase<IPersons>({ ref: EStorageKey.persons, uid, fallback: {} });

export const saveBookmarksAndPersons = async (
  bookmarks: IBookmarksObj,
  persons: IPersons,
  uid: string
) => {
  await Promise.all([
    saveToFirebase({ ref: EStorageKey.bookmarks, uid, data: bookmarks }),
    saveToFirebase({ ref: EStorageKey.persons, uid, data: persons }),
  ]);
};

export const getWebsites = (uid: string) =>
  getFromFirebase<IWebsites>({
    ref: EStorageKey.websites,
    uid,
    fallback: {},
  });

export const getLastVisited = (uid: string) =>
  getFromFirebase<ILastVisited>({
    ref: EStorageKey.lastVisited,
    uid,
    fallback: {},
  });

export const upsertLastVisited = async (hash: string, uid: string) => {
  const timestamp = Date.now();
  await upsertToFirebase({
    ref: EStorageKey.lastVisited,
    uid,
    data: { [hash]: timestamp },
  });
  return { hash, timestamp };
};

const getStoredRedirections = (uid: string) =>
  getFromFirebase<IRedirections>({
    ref: EStorageKey.redirections,
    uid,
    fallback: [],
  });

export const listRedirections = async (uid: string) =>
  (await getStoredRedirections(uid)).map(
    ({ id, alias, website, isDefault }) => ({
      id,
      alias: decodeText(alias),
      website: decodeText(website),
      isDefault,
    })
  );

const encodeLegacyUrl = (value: string) => {
  try {
    return btoa(value);
  } catch {
    try {
      return btoa(new URL(value).href);
    } catch {
      return btoa(
        value.replace(/[\u0100-\u{10ffff}]/gu, (character) =>
          encodeURIComponent(character)
        )
      );
    }
  }
};

// shortcut: old clients cannot display Unicode URLs, remove with #4356.
export const getRedirections = async (uid: string) =>
  (await listRedirections(uid)).map(({ id, alias, website, isDefault }) => ({
    id,
    alias: encodeLegacyUrl(alias),
    website: encodeLegacyUrl(website),
    isDefault,
  }));

export const saveRedirections = async (
  redirections: IRedirections,
  uid: string
) => {
  const shortcutsObj = Object.fromEntries(
    redirections.map(
      ({ id, alias, website, isDefault }, index): [number, IRedirection] => [
        index,
        {
          id,
          alias: encodeText(alias),
          website: encodeText(website),
          isDefault,
        },
      ]
    )
  );
  await saveToFirebase({
    ref: EStorageKey.redirections,
    uid,
    data: shortcutsObj,
  });
};
