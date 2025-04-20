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
import { trpcApi } from '@/apis/trpcApi';
import { ECacheBucketKeys, STORAGE_KEYS, deleteAllCache } from '@bypass/shared';
import { getUser2FAInfo } from '@helpers/fetchFromStorage';
import { IUser2FAInfo } from '../interfaces/authentication';
import {
  resetWebsites,
  syncWebsitesToStorage,
} from '@/BackgroundScript/websites/storageSync';
import { nprogress } from '@mantine/nprogress';

const syncAuthenticationToStorage = async () => {
  const { is2FAEnabled } = await trpcApi.twoFactorAuth.status.query();
  const user2FAInfo: IUser2FAInfo = {
    is2FAEnabled,
    isTOTPVerified: false,
  };
  await chrome.storage.local.set({ [STORAGE_KEYS.user2FAInfo]: user2FAInfo });
  nprogress.increment();
};

const resetAuthentication = async () => {
  const user2FAInfo = await getUser2FAInfo();
  if (!user2FAInfo) {
    console.log('User 2FA info not found');
    return;
  }
  if (IS_CHROME) {
    await chrome.identity.clearAllCachedAuthTokens();
  }
  console.log('Removed Google auth token from cache');
  await chrome.storage.local.remove(STORAGE_KEYS.user2FAInfo);
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

export const syncStorageToFirebase = async () => {
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
  console.log('Storage reset successful');
  nprogress.increment();
};

export const processPostLogin = async () => {
  // First process authentication
  await syncAuthenticationToStorage();
  // Then sync remote firebase to storage
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
