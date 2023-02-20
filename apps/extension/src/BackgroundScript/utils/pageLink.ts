import { VoidFunction } from '@bypass/shared';
import scripting from '@/helpers/chrome/scripting';
import tabs from '@/helpers/chrome/tabs';

export const bypassSingleLinkOnPage = async (
  selectorFn: VoidFunction,
  tabId: number
) => {
  const response = await scripting.executeScript({
    target: { tabId },
    func: selectorFn,
  });
  const { result }: { result: { links: string[] } | null } = response[0];
  const targetUrl = result?.links?.[0];
  if (targetUrl) {
    tabs.update(tabId, { url: targetUrl });
  }
};
