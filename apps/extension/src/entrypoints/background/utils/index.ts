import { EExtensionState } from '@/constants';

/** Store fronts the browsers refuse to script. */
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
    return extState === EExtensionState.ACTIVE
      ? 'assets/bypass_link_on_32.png'
      : 'assets/bypass_link_off_32.png';
  };
  await browser.action.setIcon({ path: getIcon() });
};

/** Allowlisted, so an unknown scheme is excluded rather than failing on injection. */
export const isValidUrl = (_url?: string): boolean => {
  if (!_url) return false;
  const url = new URL(_url);
  return (
    (url.protocol === 'http:' || url.protocol === 'https:') &&
    !restrictedHosts.has(url.hostname)
  );
};
