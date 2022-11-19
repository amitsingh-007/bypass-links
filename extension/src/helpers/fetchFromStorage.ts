import storage from 'GlobalHelpers/chrome/storage';
import { BYPASS_KEYS, EXTENSION_STATE } from 'GlobalConstants';
import { IBookmarksObj } from '@common/components/Bookmarks/interfaces';
import { UserInfo } from 'SrcPath/HomePopup/interfaces/authentication';
import { LastVisited } from 'SrcPath/HomePopup/interfaces/lastVisited';
import {
  PersonImageUrls,
  IPersons,
} from '@common/components/Persons/interfaces/persons';
import {
  IMappedRedirections,
  IRedirection,
} from 'SrcPath/BackgroundScript/interfaces/redirections';
import { ISettings } from 'SrcPath/SettingsPanel/interfaces/settings';
import { STORAGE_KEYS } from '@common/constants/storage';

export const getExtensionState = async () => {
  const { extState } = await storage.get('extState');
  return extState as EXTENSION_STATE;
};

export const getHostnames = async () => {
  const { [STORAGE_KEYS.bypass]: bypass } = await storage.get(
    STORAGE_KEYS.bypass
  );
  return (bypass || {}) as Record<string, BYPASS_KEYS>;
};

export const getRedirections = async () => {
  const { [STORAGE_KEYS.redirections]: redirections } = await storage.get(
    STORAGE_KEYS.redirections
  );
  return redirections as IRedirection[];
};

export const getMappedRedirections = async () => {
  const { mappedRedirections } = await storage.get([
    STORAGE_KEYS.mappedRedirections,
  ]);
  return (mappedRedirections || {}) as IMappedRedirections;
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

export const getSettings = async () => {
  const { [STORAGE_KEYS.settings]: settings } = await storage.get(
    STORAGE_KEYS.settings
  );
  return settings as ISettings;
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
