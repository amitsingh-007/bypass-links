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

const getOrDefault = async <T>(ref: EFirebaseDBRef, uid: string, fallback: T) =>
  (await getFromFirebase<T>({ ref, uid })) ?? fallback;

export const getBookmarks = async (uid: string) =>
  getOrDefault(EFirebaseDBRef.bookmarks, uid, EMPTY_BOOKMARKS);

export const getPersons = async (uid: string) =>
  getOrDefault<IPersons>(EFirebaseDBRef.persons, uid, {});

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

export const getWebsites = async (uid: string) =>
  getOrDefault<IWebsites>(EFirebaseDBRef.websites, uid, {});

export const getLastVisited = async (uid: string) =>
  getOrDefault<ILastVisited>(EFirebaseDBRef.lastVisited, uid, {});

export const upsertLastVisited = async (hash: string, uid: string) => {
  const timestamp = Date.now();
  await upsertToFirebase({
    ref: EFirebaseDBRef.lastVisited,
    uid,
    data: { [hash]: timestamp },
  });
  return { hash, timestamp };
};

export const getRedirections = async (uid: string) =>
  getOrDefault<IRedirections>(EFirebaseDBRef.redirections, uid, []);

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
