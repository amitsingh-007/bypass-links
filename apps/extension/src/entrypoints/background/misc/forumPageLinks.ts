import { matchForum } from '@background/websites';

const getForum_1_2_LinksFunc = () => {
  const unreadRows = document.querySelectorAll(
    '.block-row.block-row--separated:not(.block-row--alt).is-unread'
  );
  return [...unreadRows].map(
    (row) =>
      row.querySelector<HTMLAnchorElement>('a.fauxBlockLink-blockLink')?.href
  );
};

const getForum_1_2_WatchedThreadsLinksFunc = () => {
  const allPosts = document.querySelectorAll(
    '.structItemContainer .structItem-cell--main'
  );
  return [...allPosts].map((row) => {
    const lastPageLink = row.querySelector<HTMLAnchorElement>(
      '.structItem-pageJump > a:last-child'
    )?.href;
    if (lastPageLink) {
      return lastPageLink;
    }

    return row.querySelector<HTMLAnchorElement>(
      '.structItem-title > [data-preview-url]'
    )?.href;
  });
};

const getForum_3_LinksFunc = () => {
  const recentPostsNode = [
    ...document.querySelectorAll<HTMLUListElement>('.recent-posts'),
  ].at(-1);

  if (!recentPostsNode) {
    return [];
  }

  const recentPostLinks =
    recentPostsNode.querySelectorAll<HTMLAnchorElement>('.post-thumb > a');
  return [...recentPostLinks].map((link) => link.href);
};

const getForum_4_LinksFunc = () => {
  const unreadPosts = document.querySelectorAll<HTMLAnchorElement>(
    'div.tthumb_gal_item a.tthumb_grid_unread'
  );
  return [...unreadPosts].map((a) => a.href);
};

/**
 * Extractor per websites key. The selector takes the url because FORUM_1/FORUM_2
 * choose between two extractors at runtime based on the pathname, so a plain
 * `Record<string, extractor>` could not express it.
 */
type ExtractorFor = (url: URL) => () => Array<string | undefined>;

const FORUM_EXTRACTORS: Record<string, ExtractorFor> = {
  FORUM_1: ({ pathname }) =>
    pathname === '/watched/threads'
      ? getForum_1_2_WatchedThreadsLinksFunc
      : getForum_1_2_LinksFunc,
  FORUM_2: ({ pathname }) =>
    pathname === '/watched/threads'
      ? getForum_1_2_WatchedThreadsLinksFunc
      : getForum_1_2_LinksFunc,
  FORUM_3: () => getForum_3_LinksFunc,
  FORUM_4: () => getForum_4_LinksFunc,
};

export const getForumPageLinks = async (
  tabId: number,
  url: string
): Promise<string[]> => {
  const forumKey = await matchForum(url);
  const selectExtractor = forumKey ? FORUM_EXTRACTORS[forumKey] : undefined;
  if (!selectExtractor) {
    throw new Error('Not a forum page');
  }

  const [{ result }] = await browser.scripting.executeScript({
    target: { tabId },
    func: selectExtractor(new URL(url)),
  });
  return result?.filter(Boolean) ?? [];
};
