import {
  ECacheBucketKeys,
  deleteAllCache,
  invalidateAllKeys,
} from '@bypass/shared';

import {
  resetRedirections,
  syncRedirectionsToStorage,
} from '@background/redirections';
import {
  resetWebsites,
  syncWebsitesToStorage,
} from '@background/websites/storageSync';

import {
  cacheBookmarkFavicons,
  resetBookmarks,
  syncBookmarksAndPersonsFirebaseWithStorage,
  syncBookmarksToStorage,
} from '../../BookmarksPanel/utils/bookmark';
import {
  cachePersonImagesInStorage,
  clearPersonImageUrls,
  resetPersons,
  syncPersonsToStorage,
} from '../../PersonsPanel/utils/sync';
import { resetLastVisited, syncLastVisitedToStorage } from './lastVisitedSync';

const resetAuthentication = async () => {
  await browser.identity.clearAllCachedAuthTokens();
};

const syncFirebaseToStorage = async () => {
  await Promise.all([
    syncRedirectionsToStorage(),
    syncWebsitesToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
  ]);
  await invalidateAllKeys();
};

const syncStorageToFirebase = async () => {
  await syncBookmarksAndPersonsFirebaseWithStorage();
};

const resetStorage = async () => {
  await Promise.all([
    resetAuthentication(),
    resetRedirections(),
    resetWebsites(),
    resetBookmarks(),
    resetLastVisited(),
    resetPersons(),
    clearPersonImageUrls(),
  ]);
  await invalidateAllKeys();
};

export const processPostLogin = async () => {
  await syncFirebaseToStorage();
  // Independent cache warms; addAllToCache shares one pLimit so concurrency is capped
  await Promise.all([cachePersonImagesInStorage(), cacheBookmarkFavicons()]);
};

export const processPreLogout = async () => {
  // Sync changes to firebase before logout, cant sync after logout
  await syncStorageToFirebase();
};

export const processPostLogout = async () => {
  await resetStorage();
  await deleteAllCache([ECacheBucketKeys.favicon, ECacheBucketKeys.person]);
  await browser.tabs.create({ url: 'https://www.google.com/', active: false });
  await browser.tabs.create({
    url: 'https://www.google.com/imghp',
    active: false,
  });
  await browser.tabs.create({
    url: 'https://myactivity.google.com/activitycontrols/webandapp',
    active: false,
  });
};
