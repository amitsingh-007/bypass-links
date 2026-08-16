import { websitesItem } from '@/storage/items';
import { findForumExtractor } from '@background/websites/registry';

export const getForumPageLinks = async (
  tabId: number,
  url: string
): Promise<string[]> => {
  const websites = await websitesItem.getValue();
  const parsedUrl = new URL(url);
  const pickExtractor = findForumExtractor(websites, parsedUrl.hostname);

  if (!pickExtractor) {
    throw new Error('Not a forum page');
  }

  const [{ result }] = await browser.scripting.executeScript({
    target: { tabId },
    func: pickExtractor(parsedUrl),
  });
  return result?.filter(Boolean) ?? [];
};
