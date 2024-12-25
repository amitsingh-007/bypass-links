import { getWebistes } from '@/helpers/fetchFromStorage';
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
    return lastPageLink;
  });
};

const getForum_3_LinksFunc = () => {
  const recentPostsNode = [
    ...document.querySelectorAll<HTMLUListElement>('.recent-posts'),
  ].at(-1);
  const recentPostLinks =
    recentPostsNode?.querySelectorAll<HTMLAnchorElement>('.post-thumb > a');
  return [...(recentPostLinks || [])].map((link) => link.href);
};

export const getForumPageLinks = async (
  tabId: number,
  url: string
): Promise<string[]> => {
  const websites = await getWebistes();
  let executor: () => (string | undefined)[];

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
