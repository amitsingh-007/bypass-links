export enum EExtensionState {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export const MAX_PANEL_SIZE = {
  WIDTH: 800,
  HEIGHT: 600,
};

export const TEST_AUTH_DATA_KEY = '__test_auth_data';

/** Extension popup entry route. Not in @bypass/shared: meaningless on web. */
export const POPUP_HOMEPAGE = '/popup.html';
