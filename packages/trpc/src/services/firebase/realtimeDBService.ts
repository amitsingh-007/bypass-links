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

export const getBookmarks = async (uid: string) => {
  const bookmarks = await getFromFirebase<IBookmarksObj>({
    ref: EFirebaseDBRef.bookmarks,
    uid,
  });
  return bookmarks ?? EMPTY_BOOKMARKS;
};

export const getPersons = async (uid: string) => {
  const persons = await getFromFirebase<IPersons>({
    ref: EFirebaseDBRef.persons,
    uid,
  });
  return persons ?? {};
};

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

export const getWebsites = async (uid: string) => {
  const websites = await getFromFirebase<IWebsites>({
    ref: EFirebaseDBRef.websites,
    uid,
  });
  return websites ?? {};
};

export const getLastVisited = async (uid: string) => {
  const lastVisited = await getFromFirebase<ILastVisited>({
    ref: EFirebaseDBRef.lastVisited,
    uid,
  });
  return lastVisited ?? {};
};

export const upsertLastVisited = async (hash: string, uid: string) => {
  const timestamp = Date.now();
  await upsertToFirebase({
    ref: EFirebaseDBRef.lastVisited,
    uid,
    data: { [hash]: timestamp },
  });
  return { hash, timestamp };
};

export const getRedirections = async (uid: string) => {
  const redirections = await getFromFirebase<IRedirections>({
    ref: EFirebaseDBRef.redirections,
    uid,
  });
  return redirections ?? [];
};

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
