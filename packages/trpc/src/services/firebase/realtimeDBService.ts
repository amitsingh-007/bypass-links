import {
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

/**
 * Every getter supplies its own empty value, matching what its output schema
 * accepts. zod/mini: z.object rejects {}, z.array rejects {}, and z.record
 * accepts {} but rejects null - so none of these may be omitted.
 */
const EMPTY_BOOKMARKS: IBookmarksObj = {
  folderList: {},
  urlList: {},
  folders: {},
};

export const getBookmarks = async (user: IUser) => {
  return (
    (await getFromFirebase<IBookmarksObj>({
      ref: EFirebaseDBRef.bookmarks,
      uid: user.uid,
    })) ?? EMPTY_BOOKMARKS
  );
};
const saveBookmarks = async (bookmarks: IBookmarksObj, user: IUser) => {
  return saveToFirebase({
    ref: EFirebaseDBRef.bookmarks,
    uid: user.uid,
    data: bookmarks,
  });
};

export const getPersons = async (user: IUser) => {
  return (
    (await getFromFirebase<IPersons>({
      ref: EFirebaseDBRef.persons,
      uid: user.uid,
    })) ?? {}
  );
};
const savePersons = async (persons: IPersons, user: IUser) => {
  return saveToFirebase({
    ref: EFirebaseDBRef.persons,
    uid: user.uid,
    data: persons,
  });
};

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

export const getWebsites = async (user: IUser) => {
  return (
    (await getFromFirebase<IWebsites>({
      ref: EFirebaseDBRef.websites,
      uid: user.uid,
    })) ?? {}
  );
};

export const getLastVisited = async (user: IUser) => {
  return (
    (await getFromFirebase<ILastVisited>({
      ref: EFirebaseDBRef.lastVisited,
      uid: user.uid,
    })) ?? {}
  );
};

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

export const getRedirections = async (user: IUser) => {
  return (
    (await getFromFirebase<IRedirections>({
      ref: EFirebaseDBRef.redirections,
      uid: user.uid,
    })) ?? []
  );
};
export const saveRedirections = async (
  redirections: IRedirections,
  user: IUser
) => {
  const shortcutsObj = redirections.reduce<Record<number, IRedirection>>(
    (obj, { alias, website, isDefault }, index) => {
      obj[index] = {
        alias: btoa(alias),
        website: btoa(website),
        isDefault,
      };
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
