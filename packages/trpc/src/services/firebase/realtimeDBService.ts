import {
  IBookmarksObj,
  ILastVisited,
  IPersons,
  IRedirection,
  IRedirections,
  ISettings,
} from '@bypass/shared';
import { IUser } from '../../@types/trpc';
import { EFirebaseDBRef } from '../../constants/firebase';
import { getFromFirebase, saveToFirebase } from '../firebaseAdminService';

export const getBookmarks = async (user: IUser) => {
  return getFromFirebase({
    ref: EFirebaseDBRef.bookmarks,
    uid: user.uid,
  });
};
export const saveBookmarks = async (bookmarks: IBookmarksObj, user: IUser) => {
  return saveToFirebase({
    ref: EFirebaseDBRef.bookmarks,
    uid: user.uid,
    data: bookmarks,
  });
};

export const getPersons = async (user: IUser) => {
  return getFromFirebase({
    ref: EFirebaseDBRef.persons,
    uid: user.uid,
  });
};
export const savePersons = async (persons: IPersons, user: IUser) => {
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

export const getSettings = async (user: IUser) => {
  return getFromFirebase({
    ref: EFirebaseDBRef.settings,
    uid: user.uid,
  });
};
export const saveSettings = async (settings: ISettings, user: IUser) => {
  return saveToFirebase({
    ref: EFirebaseDBRef.settings,
    uid: user.uid,
    data: settings,
  });
};

export const getWebsites = async (user: IUser) => {
  return getFromFirebase({
    ref: EFirebaseDBRef.websites,
    uid: user.uid,
  });
};

export const getLastVisited = async (user: IUser) => {
  return getFromFirebase({
    ref: EFirebaseDBRef.lastVisited,
    uid: user.uid,
  });
};
export const saveLastVisited = async (
  lastVisited: ILastVisited,
  user: IUser
) => {
  return saveToFirebase({
    ref: EFirebaseDBRef.lastVisited,
    uid: user.uid,
    data: lastVisited,
  });
};

export const getRedirections = async (user: IUser) => {
  return getFromFirebase({
    ref: EFirebaseDBRef.redirections,
    uid: user.uid,
  });
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
