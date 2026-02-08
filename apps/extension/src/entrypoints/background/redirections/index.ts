import { mapRedirections } from './mapper';
import { getMappedRedirections } from '@/storage';
import { startHistoryWatch } from '@/utils/history';
import { trpcApi } from '@/apis/trpcApi';
import { redirectionsItem, mappedRedirectionsItem } from '@/storage/items';

export const redirect = async (tabId: number, url: URL) => {
  url.protocol = 'http:';

  const redirections = await getMappedRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await browser.tabs.update(tabId, { url: atob(redirectUrl) });
    await startHistoryWatch();
  }
};

export const syncRedirectionsToStorage = async () => {
  const redirections = await trpcApi.firebaseData.redirectionsGet.query();
  await redirectionsItem.setValue(redirections);
  const mappedRedirections = mapRedirections(redirections);
  await mappedRedirectionsItem.setValue(mappedRedirections);
};

export const resetRedirections = async () => {
  await redirectionsItem.removeValue();
  await mappedRedirectionsItem.removeValue();
};
