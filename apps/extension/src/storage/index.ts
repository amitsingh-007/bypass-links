import {
  bookmarksItem,
  extStateItem,
  historyStartTimeItem,
  lastVisitedItem,
  mappedRedirectionsItem,
  personsItem,
  personImageUrlsItem,
  redirectionsItem,
  websitesItem,
} from './items';

export {
  bookmarksItem,
  websitesItem,
  lastVisitedItem,
  personsItem,
  redirectionsItem,
  mappedRedirectionsItem,
  personImageUrlsItem,
  extStateItem,
  hasPendingBookmarksItem,
  hasPendingPersonsItem,
  historyStartTimeItem,
} from './items';

export const getExtensionState = async () => extStateItem.getValue();

export const getWebistes = async () => (await websitesItem.getValue())!;

export const getRedirections = async () => (await redirectionsItem.getValue())!;

export const getMappedRedirections = async () =>
  (await mappedRedirectionsItem.getValue())!;

export const getLastVisited = async () => (await lastVisitedItem.getValue())!;

export const getPersons = async () => (await personsItem.getValue())!;

export const getPersonImageUrls = async () =>
  (await personImageUrlsItem.getValue())!;

export const getBookmarks = async () => (await bookmarksItem.getValue())!;

export const getHistoryTime = async () => historyStartTimeItem.getValue();
