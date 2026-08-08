import { startHistoryWatch } from '@/utils/history';

import { getMappedRedirections } from '../navigationCache';

/**
 * Kept out of ./index so the popup, which imports the sync helpers there,
 * never pulls in the background-only navigation cache.
 */
export const redirect = async (tabId: number, url: URL) => {
  url.protocol = 'http:';

  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await browser.tabs.update(tabId, { url: atob(redirectUrl) });
    await startHistoryWatch();
  }
};
