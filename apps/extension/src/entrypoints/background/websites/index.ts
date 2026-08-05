import { websitesItem } from '@/storage/items';

/**
 * Returns the matching websites key, or undefined. One matcher for both the
 * popup gate and link extraction — they previously tested different things
 * (hostname vs full url), so a website value carrying a path disabled the
 * button even though extraction would have worked.
 */
export const matchForum = async (url: string): Promise<string | undefined> => {
  const websites = await websitesItem.getValue();
  return Object.entries(websites).find(
    // Undefined when unsynced; url.includes(undefined) would match anything
    ([, website]) => Boolean(website && url.includes(website))
  )?.[0];
};
