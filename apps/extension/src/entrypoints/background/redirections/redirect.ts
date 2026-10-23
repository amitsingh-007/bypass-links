import { startHistoryWatch } from '@/utils/history';

import { getMappedRedirections } from '../navigationCache';

export const redirect = async (tabId: number, url: URL) => {
  url.protocol = 'http:';

  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[url.href];
  if (redirectUrl) {
    await browser.tabs.update(tabId, { url: redirectUrl });
    await startHistoryWatch();
  }
};
