import { type IWebsites } from '@bypass/shared';

type WebsiteKey = keyof IWebsites;

/** Runs in the page via scripting.executeScript, so it must be self-contained. */
type LinkExtractor = () => (string | undefined)[];

const getForum_1_2_Links: LinkExtractor = () => {
  const unreadRows = document.querySelectorAll(
    '.block-row.block-row--separated:not(.block-row--alt).is-unread'
  );
  return [...unreadRows].map(
    (row) =>
      row.querySelector<HTMLAnchorElement>('a.fauxBlockLink-blockLink')?.href
  );
};

const getForum_1_2_WatchedThreadsLinks: LinkExtractor = () => {
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

const getForum_3_Links: LinkExtractor = () => {
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

const getForum_4_Links: LinkExtractor = () => {
  const unreadPosts = document.querySelectorAll<HTMLAnchorElement>(
    'div.tthumb_gal_item a.tthumb_grid_unread'
  );
  return [...unreadPosts].map((a) => a.href);
};

const pickForum_1_2_Extractor = ({ pathname }: URL) =>
  pathname === '/watched/threads'
    ? getForum_1_2_WatchedThreadsLinks
    : getForum_1_2_Links;

/**
 * The single source for "is this a forum page" and "how do I read its links",
 * so the button cannot enable on a page the extractor then rejects. Keyed by
 * website, so a schema key with no entry is a compile error.
 */
const EXTRACTOR_BY_KEY = {
  FORUM_1: pickForum_1_2_Extractor,
  FORUM_2: pickForum_1_2_Extractor,
  FORUM_3: () => getForum_3_Links,
  FORUM_4: () => getForum_4_Links,
} satisfies Record<WebsiteKey, (url: URL) => LinkExtractor>;

/** Undefined when unsynced; hostname.includes('') would match every page. */
const matchesHostname = (hostname: string, website?: string) =>
  Boolean(website && hostname.includes(website));

export const findForumExtractor = (websites: IWebsites, hostname: string) => {
  const key = (Object.keys(EXTRACTOR_BY_KEY) as WebsiteKey[]).find((website) =>
    matchesHostname(hostname, websites[website])
  );
  return key && EXTRACTOR_BY_KEY[key];
};
