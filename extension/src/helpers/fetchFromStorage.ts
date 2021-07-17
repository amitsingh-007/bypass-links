import storage from "GlobalHelpers/chrome/storage";
import { EXTENSION_STATE, STORAGE_KEYS } from "GlobalConstants";
import { IBookmarksObj } from "SrcPath/BookmarksPanel/interfaces";
import { UserInfo } from "SrcPath/HomePopup/interfaces/authentication";
import { LastVisited } from "SrcPath/HomePopup/interfaces/lastVisited";
import {
  PersonImageUrls,
  IPersons,
} from "SrcPath/PersonsPanel/interfaces/persons";
import { Redirection } from "SrcPath/ShortcutsPanel/interfaces/redirections";

export const getExtensionState = async () => {
  const { extState } = await storage.get("extState");
  return extState as EXTENSION_STATE;
};

export const getHostnames = async () => {
  const { [STORAGE_KEYS.bypass]: bypass } = await storage.get(
    STORAGE_KEYS.bypass
  );
  return (bypass || {}) as Record<string, string>;
};

export const getRedirections = async () => {
  const { [STORAGE_KEYS.redirections]: redirections } = await storage.get(
    STORAGE_KEYS.redirections
  );
  return redirections as Redirection;
};

export const getLastVisited = async (): Promise<LastVisited> => {
  const { [STORAGE_KEYS.lastVisited]: lastVisited } = await storage.get(
    STORAGE_KEYS.lastVisited
  );
  return lastVisited as LastVisited;
};

export const getUserProfile = async () => {
  const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
    STORAGE_KEYS.userProfile
  );
  return userProfile as UserInfo;
};

export const getPersons = async () => {
  const { [STORAGE_KEYS.persons]: persons } = await storage.get(
    STORAGE_KEYS.persons
  );
  return persons as IPersons;
};

export const getPersonImageUrls = async () => {
  const { [STORAGE_KEYS.personImageUrls]: personImageUrls } = await storage.get(
    STORAGE_KEYS.personImageUrls
  );
  return personImageUrls as PersonImageUrls;
};

export const getBookmarks = async () => {
  const { [STORAGE_KEYS.bookmarks]: bookmarks } = await storage.get(
    STORAGE_KEYS.bookmarks
  );
  return bookmarks as IBookmarksObj;
};
