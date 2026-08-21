import {
  type IBookmarksObj,
  type ILastVisited,
  type IPersons,
  type IRedirection,
  type IRedirections,
  type IWebsites,
} from '@bypass/shared';

import { EFirebaseDBRef } from '../../constants/firebase';
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
    ref: EFirebaseDBRef.bookmarks,
    uid,
    fallback: EMPTY_BOOKMARKS,
  });

export const getPersons = (uid: string) =>
  getFromFirebase<IPersons>({ ref: EFirebaseDBRef.persons, uid, fallback: {} });

export const saveBookmarksAndPersons = async (
  bookmarks: IBookmarksObj,
  persons: IPersons,
  uid: string
) => {
  await Promise.all([
    saveToFirebase({ ref: EFirebaseDBRef.bookmarks, uid, data: bookmarks }),
    saveToFirebase({ ref: EFirebaseDBRef.persons, uid, data: persons }),
  ]);
};

export const getWebsites = (uid: string) =>
  getFromFirebase<IWebsites>({
    ref: EFirebaseDBRef.websites,
    uid,
    fallback: {},
  });

export const getLastVisited = (uid: string) =>
  getFromFirebase<ILastVisited>({
    ref: EFirebaseDBRef.lastVisited,
    uid,
    fallback: {},
  });

export const upsertLastVisited = async (hash: string, uid: string) => {
  const timestamp = Date.now();
  await upsertToFirebase({
    ref: EFirebaseDBRef.lastVisited,
    uid,
    data: { [hash]: timestamp },
  });
  return { hash, timestamp };
};

export const getRedirections = (uid: string) =>
  getFromFirebase<IRedirections>({
    ref: EFirebaseDBRef.redirections,
    uid,
    fallback: [],
  });

export const saveRedirections = async (
  redirections: IRedirections,
  uid: string
) => {
  const shortcutsObj = Object.fromEntries(
    redirections.map(
      ({ alias, website, isDefault }, index): [number, IRedirection] => [
        index,
        { alias: btoa(alias), website: btoa(website), isDefault },
      ]
    )
  );
  await saveToFirebase({
    ref: EFirebaseDBRef.redirections,
    uid,
    data: shortcutsObj,
  });
};
