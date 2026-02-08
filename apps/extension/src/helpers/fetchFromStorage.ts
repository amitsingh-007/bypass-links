import {
  type IBookmarksObj,
  type ILastVisited,
  type IPersons,
  type IRedirections,
  type IWebsites,
  type PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';
import { type IMappedRedirections } from '@/entrypoints/background/interfaces/redirections';
import { type EExtensionState } from '@/constants';

export const getExtensionState = async () => {
  const { extState } = await chrome.storage.local.get('extState');
  return extState as EExtensionState;
};

export const getWebistes = async () => {
  const { [STORAGE_KEYS.websites]: websites = {} } =
    await chrome.storage.local.get(STORAGE_KEYS.websites);
  return websites as IWebsites;
};

export const getRedirections = async () => {
  const { [STORAGE_KEYS.redirections]: redirections } =
    await chrome.storage.local.get(STORAGE_KEYS.redirections);
  return redirections as IRedirections;
};

export const getMappedRedirections = async () => {
  const { mappedRedirections = {} } = await chrome.storage.local.get([
    STORAGE_KEYS.mappedRedirections,
  ]);
  return mappedRedirections as IMappedRedirections;
};

export const getLastVisited = async () => {
  const { [STORAGE_KEYS.lastVisited]: lastVisited } =
    await chrome.storage.local.get(STORAGE_KEYS.lastVisited);
  return lastVisited as ILastVisited;
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

export const getHistoryTime = async () => {
  const { historyStartTime } =
    await chrome.storage.local.get('historyStartTime');
  return historyStartTime as number | undefined;
};
