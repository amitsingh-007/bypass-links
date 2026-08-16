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

export const syncFirebaseToStorage = async () => {
  await Promise.all([
    syncRedirectionsToStorage(),
    syncWebsitesToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
  ]);
  await invalidateAllKeys();
};

export const syncStorageToFirebase = async () => {
  await syncBookmarksAndPersonsFirebaseWithStorage();
};

export const resetStorage = async () => {
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

/** Independent cache warms; addAllToCache shares one pLimit so concurrency is capped */
export const warmCaches = async () => {
  await Promise.all([cachePersonImagesInStorage(), cacheBookmarkFavicons()]);
};

export const clearCaches = async () => {
  await deleteAllCache([ECacheBucketKeys.favicon, ECacheBucketKeys.person]);
};

export const openGoogleActivityTabs = async () => {
  await Promise.all(
    [
      'https://www.google.com/',
      'https://www.google.com/imghp',
      'https://myactivity.google.com/activitycontrols/webandapp',
    ].map(async (url) => browser.tabs.create({ url, active: false }))
  );
};
