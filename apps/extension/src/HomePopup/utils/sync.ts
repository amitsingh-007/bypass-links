import { resetBypass, syncBypassToStorage } from '@/BackgroundScript/bypass';
import {
  resetRedirections,
  syncRedirectionsToStorage,
} from '@/BackgroundScript/redirect';
import {
  cacheBookmarkFavicons,
  resetBookmarks,
  syncBookmarksFirebaseWithStorage,
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
  syncPersonsFirebaseWithStorage,
  syncPersonsToStorage,
} from '@/PersonsPanel/utils/sync';
import {
  resetSettings,
  syncSettingsToStorage,
} from '@/SettingsPanel/utils/sync';
import { trpcApi } from '@/apis/trpcApi';
import { sendRuntimeMessage } from '@/utils/sendRuntimeMessage';
import { ECacheBucketKeys, STORAGE_KEYS, deleteAllCache } from '@bypass/shared';
import { getSettings, getUser2FAInfo } from '@helpers/fetchFromStorage';
import { AuthProgress } from './authProgress';
import { IUser2FAInfo } from '../interfaces/authentication';

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
  await chrome.identity.clearAllCachedAuthTokens();
  console.log('Removed Google auth token from cache');
  await chrome.storage.local.remove(STORAGE_KEYS.user2FAInfo);
};

const syncFirebaseToStorage = async () => {
  AuthProgress.start('Syncing storage with firebase');
  await Promise.all([
    syncRedirectionsToStorage(),
    syncBypassToStorage(),
    syncBookmarksToStorage(),
    syncLastVisitedToStorage(),
    syncPersonsToStorage(),
    syncSettingsToStorage(),
  ]);
  AuthProgress.finish('Synced storage with firebase');
};

const syncStorageToFirebase = async () => {
  AuthProgress.start('Syncing firebase with storage');
  await Promise.all([
    syncBookmarksFirebaseWithStorage(),
    syncPersonsFirebaseWithStorage(),
  ]);
  AuthProgress.finish('Synced firebase with storage');
};

const resetStorage = async () => {
  AuthProgress.start('Resetting storage');
  await Promise.all([
    resetAuthentication(),
    resetRedirections(),
    resetBypass(),
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
  } catch (e) {
    AuthProgress.finish('Caching failed');
  }
};

export const processPreLogout = async () => {
  // Sync changes to firebase before logout, cant sync after logout
  await syncStorageToFirebase();
};

export const processPostLogout = async () => {
  const settings = await getSettings();
  const { historyStartTime } = await chrome.storage.local.get([
    'historyStartTime',
  ]);
  const historyWatchTime = Date.now() - historyStartTime;
  // Reset storage
  await resetStorage();
  // Refresh browser cache
  AuthProgress.start('Clearing cache');
  await deleteAllCache([ECacheBucketKeys.favicon, ECacheBucketKeys.person]);
  AuthProgress.finish('Cleared cache');
  if (settings?.hasManageGoogleActivityConsent) {
    // Open Google Search and Google Image tabs
    await chrome.tabs.create({ url: 'https://www.google.com/' });
    await chrome.tabs.create({ url: 'https://www.google.com/imghp' });
    // Clear activity from google account
    await sendRuntimeMessage({ key: 'manageGoogleActivity', historyWatchTime });
  }
};
