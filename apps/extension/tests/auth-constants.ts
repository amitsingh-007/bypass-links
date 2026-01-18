import path from 'node:path';
import process from 'node:process';

/**
 * Cache directory path used to store auth state and browser profile.
 */
export const AUTH_CACHE_DIR = path.join(process.cwd(), '.cache');

/**
 * Path to the file containing cached localStorage and chrome.storage.local data.
 */
export const EXTENSION_STORAGE_PATH = path.join(
  AUTH_CACHE_DIR,
  'extension-storage.json'
);

/**
 * Path to the directory containing the cached Chrome profile.
 */
export const CHROME_PROFILE_DIR = path.join(AUTH_CACHE_DIR, 'chrome-profile');
