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
  resetSettings,
  syncSettingsToStorage,
} from '@/SettingsPanel/utils/sync';
import { trpcApi } from '@/apis/trpcApi';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { ECacheBucketKeys, STORAGE_KEYS, deleteAllCache } from '@bypass/shared';
import {
  getHistoryTime,
  getSettings,
  getUser2FAInfo,
} from '@helpers/fetchFromStorage';
import { IUser2FAInfo } from '../interfaces/authentication';
import { AuthProgress } from './authProgress';
import {
  resetWebsites,
  syncWebsitesToStorage,
} from '@/BackgroundScript/websites/storageSync';

const syncAuthenticationToStorage = async () => {
  AuthProgress.start('Checking 2FA status');
  const { is2FAEnabled } = await trpcApi.twoFactorAuth.status.query();
  const user2FAInfo: IUser2FAInfo = {
    is2FAEnabled,
    isTOTPVerified: false,
  };
  await chrome.storage.local.set({ [STORAGE_KEYS.user2FAInfo]: user2FAInfo });
  AuthProgress.finish('2FA status checked');
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
  AuthProgress.start('Syncing storage with firebase');
  await Promise.all([
    syncRedirectionsToStorage(),
    syncWebsitesToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
    syncSettingsToStorage(),
  ]);
  AuthProgress.finish('Synced storage with firebase');
};

export const syncStorageToFirebase = async () => {
  await syncBookmarksAndPersonsFirebaseWithStorage();
};

const resetStorage = async () => {
  AuthProgress.start('Resetting storage');
  await Promise.all([
    resetAuthentication(),
    resetRedirections(),
    resetWebsites(),
    resetBookmarks(),
    resetLastVisited(),
    resetPersons(),
    resetSettings(),
    refreshPersonImageUrlsCache(),
  ]);
  console.log('Storage reset successful');
  AuthProgress.finish('Storage reset');
};

export const processPostLogin = async () => {
  // First process authentication
  await syncAuthenticationToStorage();
  // Then sync remote firebase to storage
  await syncFirebaseToStorage();
  // Then do other processes
  try {
    await cachePersonImagesInStorage();
    AuthProgress.start('Caching bookmark favicons');
    await cacheBookmarkFavicons();
    AuthProgress.finish('Cached bookmark favicons');
  } catch {
    AuthProgress.finish('Caching failed');
  }
};

export const processPreLogout = async () => {
  // Sync changes to firebase before logout, cant sync after logout
  AuthProgress.start('Syncing firebase with storage');
  await syncStorageToFirebase();
  AuthProgress.finish('Synced firebase with storage');
};

export const processPostLogout = async () => {
  const settings = await getSettings();
  const historyStartTime = await getHistoryTime();
  // Reset storage
  await resetStorage();
  // Refresh browser cache
  AuthProgress.start('Clearing cache');
  deleteAllCache([ECacheBucketKeys.favicon, ECacheBucketKeys.person]);
  AuthProgress.finish('Cleared cache');
  if (settings?.hasManageGoogleActivityConsent) {
    // Open Google Search and Google Image tabs
    await chrome.tabs.create({ url: 'https://www.google.com/', active: false });
    await chrome.tabs.create({
      url: 'https://www.google.com/imghp',
      active: false,
    });
    // Clear activity from google account
    if (historyStartTime) {
      const historyWatchTime = Date.now() - historyStartTime;
      await sendRuntimeMessage({
        key: 'manageGoogleActivity',
        historyWatchTime,
      });
    }
  }
};
