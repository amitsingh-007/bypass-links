import { ECacheBucketKeys, deleteAllCache } from '@bypass/shared';
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
  refreshPersonImageUrlsCache,
  resetPersons,
  syncPersonsToStorage,
} from '../../PersonsPanel/utils/sync';
import {
  SIGN_IN_TOTAL_STEPS,
  SIGN_OUT_TOTAL_STEPS,
} from '../constants/progress';
import { resetLastVisited, syncLastVisitedToStorage } from './lastVisited';
import useProgressStore from '@/store/progress';

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
};

export const processPostLogin = async () => {
  const { incrementProgress } = useProgressStore.getState();
  // Sync remote firebase to storage
  await syncFirebaseToStorage();
  incrementProgress(SIGN_IN_TOTAL_STEPS);
  // Then do other processes
  await cachePersonImagesInStorage();
  incrementProgress(SIGN_IN_TOTAL_STEPS);
  await cacheBookmarkFavicons();
  incrementProgress(SIGN_IN_TOTAL_STEPS);
};

export const processPreLogout = async () => {
  const { incrementProgress } = useProgressStore.getState();
  // Sync changes to firebase before logout, cant sync after logout
  await syncStorageToFirebase();
  incrementProgress(SIGN_OUT_TOTAL_STEPS);
};

export const processPostLogout = async () => {
  const { incrementProgress } = useProgressStore.getState();
  // Reset storage
  await resetStorage();
  incrementProgress(SIGN_OUT_TOTAL_STEPS);
  // Refresh browser cache
  deleteAllCache([ECacheBucketKeys.favicon, ECacheBucketKeys.person]);
  incrementProgress(SIGN_OUT_TOTAL_STEPS);
  // Open Google Search, Google Image & Google Data tabs
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
