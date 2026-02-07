import { ECacheBucketKeys, deleteAllCache } from '@bypass/shared';
import { nprogress } from '@mantine/nprogress';
import {
  resetRedirections,
  syncRedirectionsToStorage,
} from '@/BackgroundScript/redirections';
import {
  cacheBookmarkFavicons,
  resetBookmarks,
  syncBookmarksAndPersonsFirebaseWithStorage,
  syncBookmarksToStorage,
} from '@/BookmarksPanel/utils/bookmark';
import {
  resetLastVisited,
  syncLastVisitedToStorage,
} from '@/HomePopup/utils/lastVisited';
import {
  cachePersonImagesInStorage,
  refreshPersonImageUrlsCache,
  resetPersons,
  syncPersonsToStorage,
} from '@/PersonsPanel/utils/sync';
import {
  resetWebsites,
  syncWebsitesToStorage,
} from '@/BackgroundScript/websites/storageSync';

const resetAuthentication = async () => {
  await chrome.identity.clearAllCachedAuthTokens();
};

const syncFirebaseToStorage = async () => {
  await Promise.all([
    syncRedirectionsToStorage(),
    syncWebsitesToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
  ]);
  nprogress.increment();
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
    refreshPersonImageUrlsCache(),
  ]);
  nprogress.increment();
};

export const processPostLogin = async () => {
  // Sync remote firebase to storage
  await syncFirebaseToStorage();
  // Then do other processes
  try {
    await cachePersonImagesInStorage();
    await cacheBookmarkFavicons();
  } finally {
    nprogress.increment();
  }
};

export const processPreLogout = async () => {
  // Sync changes to firebase before logout, cant sync after logout
  await syncStorageToFirebase();
  nprogress.increment();
};

export const processPostLogout = async () => {
  // Reset storage
  await resetStorage();
  // Refresh browser cache
  deleteAllCache([ECacheBucketKeys.favicon, ECacheBucketKeys.person]);
  nprogress.increment();
  // Open Google Search, Google Image & Google Data tabs
  await chrome.tabs.create({ url: 'https://www.google.com/', active: false });
  await chrome.tabs.create({
    url: 'https://www.google.com/imghp',
    active: false,
  });
  await chrome.tabs.create({
    url: 'https://myactivity.google.com/activitycontrols/webandapp',
    active: false,
  });
};
