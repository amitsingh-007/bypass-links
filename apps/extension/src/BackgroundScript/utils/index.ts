import { IExtensionState } from '@constants/index';
import action from '@helpers/chrome/action';
import { getExtensionState } from '@helpers/fetchFromStorage';
import { EXTENSION_ID } from '@/constants/manifest';
import { api } from '../../utils/api';
import { getIsExtensionActive } from '../../utils/common';

const restrictedProtocols = new Set([
  'chrome:', // Chrome browser internal URLs
  'edge:', // Edge browser internal URLs
  'about:', // Empty page URLs
  'data:', // Encoded image URLs
  'chrome-search:', // Chrome internal URLs
]);
const restrictedHosts = new Set([
  'chrome.google.com', // Chrome web store
]);

export const isValidUrl = (_url?: string): boolean => {
  if (!_url) return false;
  const url = new URL(_url);
  // Don't allow accessing other extensions
  if (url.protocol === 'chrome-extension:') {
    return url.hostname === EXTENSION_ID;
  }
  console.log(url);
  return (
    !restrictedHosts.has(url.hostname) && !restrictedProtocols.has(url.protocol)
  );
};

export const setExtensionIcon = async ({
  extState,
  hasPendingBookmarks,
  hasPendingPersons,
}: {
  extState?: IExtensionState;
  hasPendingBookmarks: boolean;
  hasPendingPersons: boolean;
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
  await action.setIcon({ path: icon });
};

export const checkForUpdates = async () => {
  const { version: latestVersion } = await api.extension.latest.query();
  const { version: currentVersion } = chrome.runtime.getManifest();
  return latestVersion === currentVersion;
};
