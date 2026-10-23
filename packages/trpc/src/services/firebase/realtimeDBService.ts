import {
  type IBookmarksObj,
  type ILastVisited,
  type IPersons,
  type IRedirection,
  type IRedirections,
  type IWebsites,
  EStorageKey,
} from '@bypass/shared/server';

import {
  getFromFirebase,
  saveToFirebase,
  upsertToFirebase,
} from '../firebaseAdminService';
import { getNamesForClient, normalizeSavedNames } from './nameCodec';

// zod/mini: z.object and z.array reject {}, z.record accepts {} but rejects null
const EMPTY_BOOKMARKS: IBookmarksObj = {
  folderList: {},
  urlList: {},
  folders: {},
};

export const getBookmarks = async (uid: string, nameCodecVersion?: 2) => {
  const bookmarks = await getFromFirebase({
    ref: EStorageKey.bookmarks,
    uid,
    fallback: EMPTY_BOOKMARKS,
  });
  return {
    ...bookmarks,
    folderList: getNamesForClient(bookmarks.folderList, nameCodecVersion),
  };
};

export const getPersons = async (uid: string, nameCodecVersion?: 2) =>
  getNamesForClient(
    await getFromFirebase<IPersons>({
      ref: EStorageKey.persons,
      uid,
      fallback: {},
    }),
    nameCodecVersion
  );

export const saveBookmarksAndPersons = async (
  bookmarks: IBookmarksObj,
  persons: IPersons,
  uid: string
) => {
  const [previousBookmarks, previousPersons] = await Promise.all([
    getBookmarks(uid, 2),
    getPersons(uid, 2),
  ]);
  await Promise.all([
    saveToFirebase({
      ref: EStorageKey.bookmarks,
      uid,
      data: {
        ...bookmarks,
        folderList: normalizeSavedNames(
          bookmarks.folderList,
          previousBookmarks.folderList
        ),
      },
    }),
    saveToFirebase({
      ref: EStorageKey.persons,
      uid,
      data: normalizeSavedNames(persons, previousPersons),
    }),
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

export const getRedirections = (uid: string) =>
  getFromFirebase<IRedirections>({
    ref: EStorageKey.redirections,
    uid,
    fallback: [],
  });

export const saveRedirections = async (
  redirections: IRedirections,
  uid: string
) => {
  const shortcutsObj = Object.fromEntries(
    redirections.map(
      ({ id, alias, website, isDefault }, index): [number, IRedirection] => [
        index,
        { id, alias: btoa(alias), website: btoa(website), isDefault },
      ]
    )
  );
  await saveToFirebase({
    ref: EStorageKey.redirections,
    uid,
    data: shortcutsObj,
  });
};
