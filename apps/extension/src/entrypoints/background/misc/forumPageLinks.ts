import { websitesItem } from '@/storage/items';
import { findForumSite } from '@background/websites/registry';

export const getForumPageLinks = async (
  tabId: number,
  url: string
): Promise<string[]> => {
  const websites = await websitesItem.getValue();
  const parsedUrl = new URL(url);
  const site = findForumSite(websites, parsedUrl.hostname);

  if (!site) {
    throw new Error('Not a forum page');
  }

  const [{ result }] = await browser.scripting.executeScript({
    target: { tabId },
    func: site.pickExtractor(parsedUrl),
  });
  return result?.filter(Boolean) ?? [];
};
