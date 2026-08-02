/**
 * Panel routes shared by the extension popup and the web app. The extension's
 * own entry route lives in the extension (POPUP_HOMEPAGE) since '/popup.html'
 * is meaningless on web.
 */
export const ROUTES = {
  SHORTCUTS_PANEL: '/shortcuts-panel/',
  BOOKMARK_PANEL: '/bookmark-panel/',
  PERSONS_PANEL: '/persons-panel/',
};
