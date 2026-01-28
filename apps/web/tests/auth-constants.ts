import path from 'node:path';

export const AUTH_CACHE_DIR = path.join('.cache', 'web');
export const WEB_STORAGE_PATH = path.join(AUTH_CACHE_DIR, 'web-storage.json');
