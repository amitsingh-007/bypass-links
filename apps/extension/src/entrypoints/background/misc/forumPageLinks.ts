import { websitesItem } from '@/storage/items';
import scripting from '@/utils/scripting';

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
  const unreadRows = document.querySelectorAll(
    '.structItemContainer > .structItem.is-unread > .structItem-cell--main'
  );
  return [...unreadRows].map((row) => {
    const topicLink = row.querySelector<HTMLAnchorElement>(
      '.structItem-title > a:not(.labelLink), [data-preview-url]'
    )?.href;
    if (topicLink) {
      return topicLink;
    }
    const lastPageLink = row.querySelector<HTMLAnchorElement>(
      '.structItem-pageJump > a:last-child'
    )?.href;
    return lastPageLink?.endsWith('/unread')
      ? `${lastPageLink}?new=1`
      : lastPageLink;
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

export const getForumPageLinks = async (
  tabId: number,
  url: string
): Promise<string[]> => {
  const websites = await websitesItem.getValue();
  let executor: () => Array<string | undefined>;

  switch (true) {
    case url.includes(websites.FORUM_1):
    case url.includes(websites.FORUM_2): {
      const { pathname } = new URL(url);
      const isWatchThreadsPage = pathname === '/watched/threads';
      executor = isWatchThreadsPage
        ? getForum_1_2_WatchedThreadsLinksFunc
        : getForum_1_2_LinksFunc;
      break;
    }

    case url.includes(websites.FORUM_3): {
      executor = getForum_3_LinksFunc;
      break;
    }

    case url.includes(websites.FORUM_4): {
      executor = getForum_4_LinksFunc;
      break;
    }

    default: {
      throw new Error('Not a forum page');
    }
  }

  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    func: executor,
  });
  return result?.filter(Boolean) ?? [];
};
