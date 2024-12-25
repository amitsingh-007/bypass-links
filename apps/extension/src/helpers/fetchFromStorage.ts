import { IMappedRedirections } from '@/BackgroundScript/interfaces/redirections';
import { IUser2FAInfo } from '@/HomePopup/interfaces/authentication';
import { EExtensionState } from '@/constants';
import {
  IBookmarksObj,
  ILastVisited,
  IPersons,
  IRedirections,
  ISettings,
  IWebsites,
  PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';

export const getExtensionState = async (): Promise<EExtensionState> => {
  const { extState } = await chrome.storage.local.get('extState');
  return extState;
};

export const getWebistes = async (): Promise<IWebsites> => {
  const { [STORAGE_KEYS.websites]: websites } = await chrome.storage.local.get(
    STORAGE_KEYS.websites
  );
  return websites || {};
};

export const getRedirections = async (): Promise<IRedirections> => {
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

export const getLastVisited = async (): Promise<ILastVisited> => {
  const { [STORAGE_KEYS.lastVisited]: lastVisited } =
    await chrome.storage.local.get(STORAGE_KEYS.lastVisited);
  return lastVisited;
};

export const getUser2FAInfo = async (): Promise<IUser2FAInfo> => {
  const { [STORAGE_KEYS.user2FAInfo]: user2FAInfo } =
    await chrome.storage.local.get(STORAGE_KEYS.user2FAInfo);
  return user2FAInfo;
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

export const getHistoryTime = async (): Promise<number | undefined> => {
  const { historyStartTime } =
    await chrome.storage.local.get('historyStartTime');
  return historyStartTime;
};
