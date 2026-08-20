import { type EExtensionState } from '@/constants';
import { getIsExtensionActive } from '@/utils/common';

const restrictedProtocols = new Set([
  'chrome:',
  'chrome-native:',
  'edge:',
  'about:',
  'data:',
  'chrome-search:',
  'chrome-extension:',
  'content:', // Tampermonkey related URLs
  'file:',
  'devtools:',
  'blob:',
  'webtorrent:',
  'magnet:',
  'orion:',
  'moz-extension:',
  'view-source:',
]);
const restrictedHosts = new Set([
  'chrome.google.com',
  'chromewebstore.google.com',
  'microsoftedge.microsoft.com',
  'addons.mozilla.org',
]);

export const setExtensionIcon = async ({
  extState,
  hasPendingBookmarks,
  hasPendingPersons,
}: {
  extState: EExtensionState;
  hasPendingBookmarks: boolean;
  hasPendingPersons: boolean;
}) => {
  const getIcon = () => {
    if (hasPendingBookmarks || hasPendingPersons) {
      return 'assets/bypass_link_pending_32.png';
    }
    return getIsExtensionActive(extState)
      ? 'assets/bypass_link_on_32.png'
      : 'assets/bypass_link_off_32.png';
  };
  await browser.action.setIcon({ path: getIcon() });
};

export const isValidUrl = (_url?: string): boolean => {
  if (!_url) return false;
  const url = new URL(_url);
  return (
    !restrictedHosts.has(url.hostname) && !restrictedProtocols.has(url.protocol)
  );
};
