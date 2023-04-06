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

export const getExtensionState = async (): Promise<IExtensionState> => {
  const { extState } = await chrome.storage.local.get('extState');
  return extState;
};

export const getHostnames = async (): Promise<Record<string, IBypassKeys>> => {
  const { [STORAGE_KEYS.bypass]: bypass } = await chrome.storage.local.get(
    STORAGE_KEYS.bypass
  );
  return bypass || {};
};

export const getRedirections = async (): Promise<IRedirection[]> => {
  const { [STORAGE_KEYS.redirections]: redirections } =
    await chrome.storage.local.get(STORAGE_KEYS.redirections);
  return redirections;
};

export const getMappedRedirections = async (): Promise<IMappedRedirections> => {
  const { mappedRedirections } = await chrome.storage.local.get([
    STORAGE_KEYS.mappedRedirections,
  ]);
  return mappedRedirections || {};
};

export const getLastVisited = async (): Promise<LastVisited> => {
  const { [STORAGE_KEYS.lastVisited]: lastVisited } =
    await chrome.storage.local.get(STORAGE_KEYS.lastVisited);
  return lastVisited;
};

export const getUserProfile = async (): Promise<UserInfo> => {
  const { [STORAGE_KEYS.userProfile]: userProfile } =
    await chrome.storage.local.get(STORAGE_KEYS.userProfile);
  return userProfile;
};

export const getSettings = async (): Promise<ISettings> => {
  const { [STORAGE_KEYS.settings]: settings } = await chrome.storage.local.get(
    STORAGE_KEYS.settings
  );
  return settings;
};

export const getPersons = async (): Promise<IPersons> => {
  const { [STORAGE_KEYS.persons]: persons } = await chrome.storage.local.get(
    STORAGE_KEYS.persons
  );
  return persons;
};

export const getPersonImageUrls = async (): Promise<PersonImageUrls> => {
  const { [STORAGE_KEYS.personImageUrls]: personImageUrls } =
    await chrome.storage.local.get(STORAGE_KEYS.personImageUrls);
  return personImageUrls;
};

export const getBookmarks = async (): Promise<IBookmarksObj> => {
  const { [STORAGE_KEYS.bookmarks]: bookmarks } =
    await chrome.storage.local.get(STORAGE_KEYS.bookmarks);
  return bookmarks;
};
