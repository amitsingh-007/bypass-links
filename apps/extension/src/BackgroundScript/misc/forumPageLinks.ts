import scripting from '@/utils/scripting';

const getForumPageLinksFunc = () => {
  const unreadRows = document.querySelectorAll(
    '.block-row.block-row--separated:not(.block-row--alt).is-unread'
  );
  return [...unreadRows].map(
    (row) =>
      row.querySelector<HTMLAnchorElement>('a.fauxBlockLink-blockLink')?.href
  );
};

const getForumWatchedThreadsLinksFunc = () => {
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

export const getForumPageLinks = async (
  tabId?: number,
  url?: string
): Promise<string[]> => {
  if (!tabId || !url) {
    throw new Error('No tabId/url found in getForumPageLinks()');
  }
  const { pathname } = new URL(url);
  const isWatchThreadsPage = pathname === '/watched/threads';
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    func: isWatchThreadsPage
      ? getForumWatchedThreadsLinksFunc
      : getForumPageLinksFunc,
  });
  return result?.filter(Boolean) ?? [];
};
