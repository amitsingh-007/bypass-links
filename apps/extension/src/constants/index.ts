export enum EExtensionState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const MAX_PANEL_SIZE = {
  WIDTH: 800,
  HEIGHT: 600,
};

export const TEST_AUTH_DATA_KEY = '__test_auth_data';

export const POPUP_HOMEPAGE = '/popup.html';

/**
 * Extension-only storage keys (the shared ones live in `STORAGE_KEYS`).
 * Kept here rather than in `storage/items.ts` because that module runs
 * `storage.defineItem` at import time, which touches `browser.runtime` and so
 * cannot be imported from a Playwright Node worker.
 */
export const EXT_STORAGE_KEYS = {
  extState: 'extState',
  hasPendingBookmarks: 'hasPendingBookmarks',
  hasPendingPersons: 'hasPendingPersons',
  historyStartTime: 'historyStartTime',
} as const;

/** Keys whose change should refresh the toolbar icon. */
export const ICON_KEYS = [
  EXT_STORAGE_KEYS.extState,
  EXT_STORAGE_KEYS.hasPendingBookmarks,
  EXT_STORAGE_KEYS.hasPendingPersons,
] as const;
