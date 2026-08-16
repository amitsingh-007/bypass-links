import {
  getEncryptedRedirection,
  type IBookmarksObj,
  type ILastVisited,
  type IPersons,
  type IRedirection,
  type IRedirections,
  type IWebsites,
} from '@bypass/shared';

import { type IUser } from '../../@types/trpc';
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

/** The fallback is what keeps each router's zod output schema satisfied. */
const readRef =
  <T>(ref: EFirebaseDBRef, fallback: T) =>
  async (user: IUser) =>
    (await getFromFirebase<T>({ ref, uid: user.uid })) ?? fallback;

export const getBookmarks = readRef<IBookmarksObj>(
  EFirebaseDBRef.bookmarks,
  EMPTY_BOOKMARKS
);
const saveBookmarks = async (data: IBookmarksObj, user: IUser) =>
  saveToFirebase({ ref: EFirebaseDBRef.bookmarks, uid: user.uid, data });

export const getPersons = readRef<IPersons>(EFirebaseDBRef.persons, {});
const savePersons = async (data: IPersons, user: IUser) =>
  saveToFirebase({ ref: EFirebaseDBRef.persons, uid: user.uid, data });

export const saveBookmarksAndPersons = async (
  bookmarks: IBookmarksObj,
  persons: IPersons,
  user: IUser
) => {
  const [isBookmarksSaved, isPersonsSaved] = await Promise.all([
    saveBookmarks(bookmarks, user),
    savePersons(persons, user),
  ]);
  return isBookmarksSaved && isPersonsSaved;
};

export const getWebsites = readRef<IWebsites>(EFirebaseDBRef.websites, {});

export const getLastVisited = readRef<ILastVisited>(
  EFirebaseDBRef.lastVisited,
  {}
);

export const upsertLastVisited = async (hash: string, user: IUser) => {
  const timestamp = Date.now();
  const success = await upsertToFirebase({
    ref: EFirebaseDBRef.lastVisited,
    uid: user.uid,
    data: { [hash]: timestamp },
  });
  if (!success) {
    throw new Error('Failed to upsert lastVisited entry to Firebase');
  }
  return { hash, timestamp };
};

export const getRedirections = readRef<IRedirections>(
  EFirebaseDBRef.redirections,
  []
);
export const saveRedirections = async (
  redirections: IRedirections,
  user: IUser
) => {
  const shortcutsObj = redirections.reduce<Record<number, IRedirection>>(
    (obj, redirection, index) => {
      obj[index] = getEncryptedRedirection(redirection);
      return obj;
    },
    {}
  );
  return saveToFirebase({
    ref: EFirebaseDBRef.redirections,
    uid: user.uid,
    data: shortcutsObj,
  });
};
