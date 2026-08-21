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

/** Not in `storage/items.ts`: that module cannot be imported from a Node worker. */
export enum EExtStorageKey {
  EXT_STATE = 'extState',
  HAS_PENDING_BOOKMARKS = 'hasPendingBookmarks',
  HAS_PENDING_PERSONS = 'hasPendingPersons',
  HISTORY_START_TIME = 'historyStartTime',
}

export const ICON_KEYS = [
  EExtStorageKey.EXT_STATE,
  EExtStorageKey.HAS_PENDING_BOOKMARKS,
  EExtStorageKey.HAS_PENDING_PERSONS,
] as const;
