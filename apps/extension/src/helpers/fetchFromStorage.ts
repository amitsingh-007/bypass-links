import {
  type IBookmarksObj,
  type ILastVisited,
  type IPersons,
  type IRedirections,
  type IWebsites,
  type PersonImageUrls,
  STORAGE_KEYS,
} from '@bypass/shared';
import { type IMappedRedirections } from '@background/interfaces/redirections';
import { type EExtensionState } from '@/constants';

export const getExtensionState = async () => {
  const { extState } = await browser.storage.local.get('extState');
  return extState as EExtensionState;
};

export const getWebistes = async () => {
  const { [STORAGE_KEYS.websites]: websites = {} } =
    await browser.storage.local.get(STORAGE_KEYS.websites);
  return websites as IWebsites;
};

export const getRedirections = async () => {
  const { [STORAGE_KEYS.redirections]: redirections } =
    await browser.storage.local.get(STORAGE_KEYS.redirections);
  return redirections as IRedirections;
};

export const getMappedRedirections = async () => {
  const { mappedRedirections = {} } = await browser.storage.local.get([
    STORAGE_KEYS.mappedRedirections,
  ]);
  return mappedRedirections as IMappedRedirections;
};

export const getLastVisited = async () => {
  const { [STORAGE_KEYS.lastVisited]: lastVisited } =
    await browser.storage.local.get(STORAGE_KEYS.lastVisited);
  return lastVisited as ILastVisited;
};

export const getPersons = async () => {
  const { [STORAGE_KEYS.persons]: persons } = await browser.storage.local.get(
    STORAGE_KEYS.persons
  );
  return persons as IPersons;
};

export const getPersonImageUrls = async () => {
  const { [STORAGE_KEYS.personImageUrls]: personImageUrls } =
    await browser.storage.local.get(STORAGE_KEYS.personImageUrls);
  return personImageUrls as PersonImageUrls;
};

export const getBookmarks = async () => {
  const { [STORAGE_KEYS.bookmarks]: bookmarks } =
    await browser.storage.local.get(STORAGE_KEYS.bookmarks);
  return bookmarks as IBookmarksObj;
};

export const getHistoryTime = async () => {
  const { historyStartTime } =
    await browser.storage.local.get('historyStartTime');
  return historyStartTime as number | undefined;
};
