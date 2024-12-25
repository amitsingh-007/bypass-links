import { EExtensionState } from '@/constants';
import { getExtensionState } from '@helpers/fetchFromStorage';
import { getIsExtensionActive } from '../../utils/common';

const restrictedProtocols = new Set([
  'chrome:', // Chrome browser internal URLs
  'chrome-native:',
  'edge:', // Edge browser internal URLs
  'about:', // Empty page URLs
  'data:', // Encoded image URLs
  'chrome-search:', // Chrome internal URLs
  'chrome-extension:', // Chrome extension URLs
  'content:', // Tampermonkey related URLs
  'file:', // File System URLs
  'devtools:', // Devtools URLs
  'blob:', // Blob URLs
  'webtorrent:', // WebTorrent URLs
  'magnet:', // Magnet URLs
  'orion:', // Orion browser internal URLs
  'moz-extension:', // Firefox extension URLs
  'view-source:', // View page source URLs
]);
const restrictedHosts = new Set([
  'chrome.google.com', // Legacy chrome web store
  'chromewebstore.google.com', // New Chrome web store
  'microsoftedge.microsoft.com', // Microsoft Edge web store
  'addons.mozilla.org', // Firefox addon store
]);

export const isValidUrl = (_url?: string): boolean => {
  if (!_url) return false;
  const url = new URL(_url);
  return (
    !restrictedHosts.has(url.hostname) && !restrictedProtocols.has(url.protocol)
  );
};

export const setExtensionIcon = async ({
  extState,
  hasPendingBookmarks,
  hasPendingPersons,
}: {
  extState?: EExtensionState;
  hasPendingBookmarks?: boolean;
  hasPendingPersons?: boolean;
}) => {
  let icon: string;
  if (hasPendingBookmarks === true || hasPendingPersons === true) {
    icon = 'assets/bypass_link_pending_32.png';
  } else {
    const newExtState = extState ?? (await getExtensionState());
    icon = getIsExtensionActive(newExtState)
      ? 'assets/bypass_link_on_32.png'
      : 'assets/bypass_link_off_32.png';
  }
  await chrome.action.setIcon({ path: icon });
};

export const isValidTabUrl = async (tabId: number) => {
  const tab = await chrome.tabs.get(tabId);
  return isValidUrl(tab.url);
};
