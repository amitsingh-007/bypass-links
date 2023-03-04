import {
  IMappedRedirections,
  IRedirection,
} from '@/BackgroundScript/interfaces/redirections';
import { UserInfo } from '@/HomePopup/interfaces/authentication';
import { LastVisited } from '@/HomePopup/interfaces/lastVisited';
import { ISettings } from '@/SettingsPanel/interfaces/settings';
import {
  IBookmarksObj,
  IPersons,
  PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';
import { IBypassKeys, IExtensionState } from '@constants/index';

export const getExtensionState = async () => {
  const { extState } = await chrome.storage.local.get('extState');
  return extState as IExtensionState;
};

export const getHostnames = async () => {
  const { [STORAGE_KEYS.bypass]: bypass } = await chrome.storage.local.get(
    STORAGE_KEYS.bypass
  );
  return (bypass || {}) as Record<string, IBypassKeys>;
};

export const getRedirections = async () => {
  const { [STORAGE_KEYS.redirections]: redirections } =
    await chrome.storage.local.get(STORAGE_KEYS.redirections);
  return redirections as IRedirection[];
};

export const getMappedRedirections = async () => {
  const { mappedRedirections } = await chrome.storage.local.get([
    STORAGE_KEYS.mappedRedirections,
  ]);
  return (mappedRedirections || {}) as IMappedRedirections;
};

export const getLastVisited = async (): Promise<LastVisited> => {
  const { [STORAGE_KEYS.lastVisited]: lastVisited } =
    await chrome.storage.local.get(STORAGE_KEYS.lastVisited);
  return lastVisited as LastVisited;
};

export const getUserProfile = async () => {
  const { [STORAGE_KEYS.userProfile]: userProfile } =
    await chrome.storage.local.get(STORAGE_KEYS.userProfile);
  return userProfile as UserInfo;
};

export const getSettings = async () => {
  const { [STORAGE_KEYS.settings]: settings } = await chrome.storage.local.get(
    STORAGE_KEYS.settings
  );
  return settings as ISettings;
};

export const getPersons = async () => {
  const { [STORAGE_KEYS.persons]: persons } = await chrome.storage.local.get(
    STORAGE_KEYS.persons
  );
  return persons as IPersons;
};

export const getPersonImageUrls = async () => {
  const { [STORAGE_KEYS.personImageUrls]: personImageUrls } =
    await chrome.storage.local.get(STORAGE_KEYS.personImageUrls);
  return personImageUrls as PersonImageUrls;
};

export const getBookmarks = async () => {
  const { [STORAGE_KEYS.bookmarks]: bookmarks } =
    await chrome.storage.local.get(STORAGE_KEYS.bookmarks);
  return bookmarks as IBookmarksObj;
};
