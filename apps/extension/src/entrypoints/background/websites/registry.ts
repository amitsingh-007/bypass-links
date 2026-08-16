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

/**
 * The single source for "is this a forum page" and "how do I read its links",
 * so the button cannot enable on a page the extractor then rejects.
 */
const FORUM_SITES = [
  {
    keys: ['FORUM_1', 'FORUM_2'],
    pickExtractor: ({ pathname }: URL) =>
      pathname === '/watched/threads'
        ? getForum_1_2_WatchedThreadsLinks
        : getForum_1_2_Links,
  },
  { keys: ['FORUM_4'], pickExtractor: () => getForum_4_Links },
  { keys: ['FORUM_3'], pickExtractor: () => getForum_3_Links },
] as const satisfies readonly {
  keys: readonly WebsiteKey[];
  pickExtractor: (url: URL) => LinkExtractor;
}[];

// Compile error if a schema key has no registry entry
type CoveredKey = (typeof FORUM_SITES)[number]['keys'][number];
type AssertCovers<T extends Record<WebsiteKey, unknown>> = T;
export type _AllWebsiteKeysCovered = AssertCovers<Record<CoveredKey, true>>;

/** Undefined when unsynced; hostname.includes('') would match every page. */
const matchesHostname = (hostname: string, website?: string) =>
  Boolean(website && hostname.includes(website));

export const findForumSite = (websites: IWebsites, hostname: string) =>
  FORUM_SITES.find((site) =>
    site.keys.some((key) => matchesHostname(hostname, websites[key]))
  );
