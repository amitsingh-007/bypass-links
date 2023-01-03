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
import {
  CACHE_BUCKET_KEYS,
  deleteAllCache,
  status2FA,
  STORAGE_KEYS,
} from '@bypass/shared';
import identity from '@helpers/chrome/identity';
import runtime from '@helpers/chrome/runtime';
import storage from '@helpers/chrome/storage';
import tabs from '@helpers/chrome/tabs';
import { getSettings, getUserProfile } from '@helpers/fetchFromStorage';
import { UserInfo } from '../interfaces/authentication';
import { AuthProgress } from './authProgress';

const syncAuthenticationToStorage = async (userProfile: UserInfo) => {
  AuthProgress.start('Checking 2FA status');
  const { is2FAEnabled } = await status2FA(userProfile.uid ?? '');
  userProfile.is2FAEnabled = is2FAEnabled;
  userProfile.isTOTPVerified = false;
  await storage.set({ [STORAGE_KEYS.userProfile]: userProfile });
  AuthProgress.finish('2FA status checked');
};

const resetAuthentication = async () => {
  const userProfile = await getUserProfile();
  if (!userProfile) {
    console.log('User profile not found');
    return;
  }
  await identity.removeCachedAuthToken({
    token: userProfile.googleAuthToken ?? '',
  });
  console.log('Removed Google auth token from cache');
  await storage.remove(STORAGE_KEYS.userProfile);
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

export const processPostLogin = async (userProfile: UserInfo) => {
  //First process authentication
  await syncAuthenticationToStorage(userProfile);
  //Then sync remote firebase to storage
  await syncFirebaseToStorage();
  //Then do other processes
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
  //Sync changes to firebase before logout, cant sync after logout
  await syncStorageToFirebase();
};

export const processPostLogout = async () => {
  const settings = await getSettings();
  const { historyStartTime } = await storage.get(['historyStartTime']);
  const historyWatchTime = Date.now() - historyStartTime;
  //Reset storage
  await resetStorage();
  //Refresh browser cache
  AuthProgress.start('Clearing cache');
  await deleteAllCache([CACHE_BUCKET_KEYS.favicon, CACHE_BUCKET_KEYS.person]);
  AuthProgress.finish('Cleared cache');
  if (settings?.hasManageGoogleActivityConsent) {
    //Open Google Seach and Google Image tabs
    await tabs.create({ url: 'https://www.google.com/' });
    await tabs.create({ url: 'https://www.google.com/imghp' });
    //Clear activity from google account
    await runtime.sendMessage<{ manageGoogleActivity: string }>({
      manageGoogleActivity: { historyWatchTime },
    });
  }
};
