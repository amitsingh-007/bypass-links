import { startHistoryWatch } from '@/utils/history';

import { getMappedRedirections } from '../navigationCache';

export const redirect = async (tabId: number, url: URL) => {
  url.protocol = 'http:';

  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await Promise.all([
      browser.tabs.update(tabId, { url: atob(redirectUrl) }),
      startHistoryWatch(),
    ]);
  }
};
