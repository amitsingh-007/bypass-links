import path from 'node:path';

export const AUTH_CACHE_DIR = path.join('.playwright', '.cache', 'extension');

export const EXTENSION_STORAGE_PATH = path.join(
  AUTH_CACHE_DIR,
  'extension-storage.json'
);

export const CHROME_PROFILE_DIR = path.join(AUTH_CACHE_DIR, 'chrome-profile');
