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

export const getRedirections = async () => redirectionsItem.getValue();

export const getMappedRedirections = async () =>
  mappedRedirectionsItem.getValue();

export const getLastVisited = async () => lastVisitedItem.getValue();

export const getPersons = async () => personsItem.getValue();

export const getPersonImageUrls = async () => personImageUrlsItem.getValue();

export const getBookmarks = async () => bookmarksItem.getValue();

export const getHistoryTime = async () => historyStartTimeItem.getValue();
