import { TEST_SITES, TEST_TIMEOUTS } from '@bypass/shared/tests';
import { type Page } from '@playwright/test';

import { EExtStorageKey } from '@/constants';
import {
  type RuntimeInput,
  type RuntimeKeys,
  type RuntimeOutput,
} from '@/utils/sendRuntimeMessage';

import { expect, test } from '../fixtures/background-fixture';
import { getRecordedTabs, recordCreatedTabs } from '../utils/test-utils';

/**
 * The scraper runs inside the page, so the fixture needs a real https origin,
 * but the *branch* is chosen by substring-matching the synced website against
 * the url in the message rather than the tab, so one host serves every forum.
 */
const FORUM_HOST = 'forum.test';
/** Deliberately not a substring of `FORUM_HOST`, which is how hosts are matched. */
const UNRELATED_HOST = 'somewhere-else.test';

const UNREAD_ROWS_HTML = `
  <div class="block-row block-row--separated is-unread">
    <a class="fauxBlockLink-blockLink" href="/thread/unread-1"></a>
  </div>
  <div class="block-row block-row--separated block-row--alt is-unread">
    <a class="fauxBlockLink-blockLink" href="/thread/alt-skipped"></a>
  </div>
  <div class="block-row block-row--separated">
    <a class="fauxBlockLink-blockLink" href="/thread/read-skipped"></a>
  </div>
`;

const WATCHED_THREADS_HTML = `
  <div class="structItemContainer">
    <div class="structItem-cell--main">
      <div class="structItem-pageJump"><a href="/p/1"></a><a href="/p/last"></a></div>
    </div>
    <div class="structItem-cell--main">
      <div class="structItem-title"><a data-preview-url href="/preview/2"></a></div>
    </div>
  </div>
`;

const RECENT_POSTS_HTML = `
  <ul class="recent-posts">
    <li class="post-thumb"><a href="/stale"></a></li>
  </ul>
  <ul class="recent-posts">
    <li class="post-thumb"><a href="/recent-1"></a></li>
    <li class="post-thumb"><a href="/recent-2"></a></li>
  </ul>
`;

const GALLERY_HTML = `
  <div class="tthumb_gal_item"><a class="tthumb_grid_unread" href="/gal/unread"></a></div>
  <div class="tthumb_gal_item"><a class="tthumb_grid_read" href="/gal/read-skipped"></a></div>
`;

const LINKLESS_ROWS_HTML = `
  <div class="block-row block-row--separated is-unread"></div>
  <div class="block-row block-row--separated is-unread"><span>no anchor</span></div>
`;

interface ForumCase {
  name: string;
  key: 'FORUM_1' | 'FORUM_2' | 'FORUM_3' | 'FORUM_4';
  path?: string;
  html: string;
  expected: string[];
}

const FORUM_CASES: ForumCase[] = [
  {
    name: 'forum one keeps only unread, non-alt rows',
    key: 'FORUM_1',
    html: UNREAD_ROWS_HTML,
    expected: ['/thread/unread-1'],
  },
  {
    name: 'forum two shares the forum one scraper',
    key: 'FORUM_2',
    html: UNREAD_ROWS_HTML,
    expected: ['/thread/unread-1'],
  },
  {
    name: 'watched threads prefers the last page jump, else the preview link',
    key: 'FORUM_1',
    path: '/watched/threads',
    html: WATCHED_THREADS_HTML,
    expected: ['/p/last', '/preview/2'],
  },
  {
    name: 'forum three reads only the newest recent-posts block',
    key: 'FORUM_3',
    html: RECENT_POSTS_HTML,
    expected: ['/recent-1', '/recent-2'],
  },
  {
    name: 'forum four keeps only unread gallery items',
    key: 'FORUM_4',
    html: GALLERY_HTML,
    expected: ['/gal/unread'],
  },
  {
    name: 'unread rows carrying no anchor are dropped',
    key: 'FORUM_1',
    html: LINKLESS_ROWS_HTML,
    expected: [],
  },
  {
    name: 'a matched forum with nothing to read yields no links',
    key: 'FORUM_1',
    html: '<p>nothing to read</p>',
    expected: [],
  },
];

const sendMessage = async <K extends RuntimeKeys>(
  popup: Page,
  input: Extract<RuntimeInput, { key: K }>
): Promise<RuntimeOutput[K]> =>
  popup.evaluate(async (message) => chrome.runtime.sendMessage(message), input);

const findTabId = async (popup: Page, url: string) =>
  popup.evaluate(async (target) => {
    const [tab] = await chrome.tabs.query({ url: target });
    return tab?.id ?? -1;
  }, url);

test('picks a scraper per forum and returns absolute links', async ({
  isolatedBackground,
}) => {
  const popup = await isolatedBackground.openPopup();

  for (const forumCase of FORUM_CASES) {
    await test.step(forumCase.name, async () => {
      const url = `https://${FORUM_HOST}${forumCase.path ?? '/'}`;
      await isolatedBackground.writeStorage({
        websites: { [forumCase.key]: FORUM_HOST },
      });
      const tab = await isolatedBackground.openFixturePage(url, forumCase.html);

      const { forumPageLinks } = await sendMessage(popup, {
        key: 'openWebsiteLinks',
        tabId: await findTabId(popup, url),
        url,
      });

      expect(forumPageLinks).toEqual(
        forumCase.expected.map((path) => `https://${FORUM_HOST}${path}`)
      );
      await tab.close();
    });
  }
});

test('answers with no links when the scrape cannot run', async ({
  isolatedBackground,
}) => {
  await isolatedBackground.writeStorage({ websites: {} });
  const popup = await isolatedBackground.openPopup();
  const url = `https://${FORUM_HOST}/`;
  const tab = await isolatedBackground.openFixturePage(url, UNREAD_ROWS_HTML);

  const { forumPageLinks } = await sendMessage(popup, {
    key: 'openWebsiteLinks',
    tabId: await findTabId(popup, url),
    url,
  });

  expect(forumPageLinks).toEqual([]);
  await tab.close();
});

/**
 * The popup awaits the reply, so a scrape that cannot run at all still has to
 * answer: a closed tab makes `executeScript` reject outright.
 */
test('answers with no links when the tab is already gone', async ({
  isolatedBackground,
}) => {
  await isolatedBackground.writeStorage({ websites: { FORUM_1: FORUM_HOST } });
  const popup = await isolatedBackground.openPopup();
  const url = `https://${FORUM_HOST}/`;
  const tab = await isolatedBackground.openFixturePage(url, UNREAD_ROWS_HTML);
  const tabId = await findTabId(popup, url);
  await tab.close();

  const { forumPageLinks } = await sendMessage(popup, {
    key: 'openWebsiteLinks',
    tabId,
    url,
  });

  expect(forumPageLinks).toEqual([]);
});

test.describe('Forum button', () => {
  let syncedWebsites: unknown;
  // Snapshotted, because the click opens a tab we never get a handle on and
  // this profile is worker scoped -- everything new here is ours to clean up
  let pagesBefore = new Set<Page>();

  test.beforeEach(async ({ sharedBackground }) => {
    syncedWebsites = await sharedBackground.readStorage('websites');
    pagesBefore = new Set(sharedBackground.context.pages());
    await sharedBackground.writeStorage({
      websites: { FORUM_1: FORUM_HOST },
    });
  });

  test.afterEach(async ({ sharedBackground }) => {
    const { context } = sharedBackground;
    await sharedBackground.writeStorage({ websites: syncedWebsites ?? {} });
    await Promise.all(
      context
        .pages()
        .filter((page) => !pagesBefore.has(page))
        .map((page) => page.close())
    );
  });

  test('reports success once it has opened the collected links', async ({
    sharedBackground,
  }) => {
    const { context } = sharedBackground;
    const forumRoute = `https://${FORUM_HOST}/**`;
    try {
      /**
       * The popup enables the button from the active tab, so the forum tab has
       * to take focus before this reload -- opening the popup last would leave
       * the popup itself in front.
       */
      const popup = await sharedBackground.openPopup();
      // Keep the tab the click opens off the network
      await context.route(forumRoute, async (route) => {
        await route.fulfill({ contentType: 'text/html', body: '' });
      });

      await sharedBackground.openFixturePage(
        `https://${FORUM_HOST}/`,
        UNREAD_ROWS_HTML
      );
      await popup.reload({ waitUntil: 'domcontentloaded' });

      const forumButton = popup.getByRole('button', { name: 'Forum' });
      await expect(forumButton).toBeEnabled();
      await forumButton.click();

      await expect(
        popup.getByRole('button', { name: 'Success' })
      ).toBeVisible();
    } finally {
      await context.unroute(forumRoute);
    }
  });

  // Same markup on another host, so only the synced website decides this
  test('stays disabled on a page that is not a synced forum', async ({
    sharedBackground,
  }) => {
    const popup = await sharedBackground.openPopup();
    await sharedBackground.openFixturePage(
      `https://${UNRELATED_HOST}/`,
      UNREAD_ROWS_HTML
    );
    await popup.reload({ waitUntil: 'domcontentloaded' });

    await expect(popup.getByRole('button', { name: 'Forum' })).toBeDisabled();
  });
});

test.describe('Opening collected links', () => {
  test('opens one background tab per url, in order', async ({
    isolatedBackground,
  }) => {
    await isolatedBackground.clearHistoryStartTime();
    const popup = await isolatedBackground.openPopup();
    const urls = [TEST_SITES.EXAMPLE_COM, TEST_SITES.EXAMPLE_ORG];

    await recordCreatedTabs(popup);
    await sendMessage(popup, { key: 'openLinksInTabs', urls });

    // Opens are paced a second apart, so both tabs land well after the reply
    await expect
      .poll(() => getRecordedTabs(popup), { timeout: TEST_TIMEOUTS.PAGE_OPEN })
      // `new URL` because Chrome hands the recorder its own normalised form
      .toEqual(urls.map((url) => ({ url: new URL(url).href, active: false })));
    await expect
      .poll(() =>
        isolatedBackground.readStorage(EExtStorageKey.HISTORY_START_TIME)
      )
      .toBeDefined();
  });

  test('opens nothing and starts no history watch for an empty list', async ({
    isolatedBackground,
  }) => {
    await isolatedBackground.clearHistoryStartTime();
    const popup = await isolatedBackground.openPopup();
    const context = popup.context();
    const before = context.pages().length;

    await sendMessage(popup, { key: 'openLinksInTabs', urls: [] });

    expect(context.pages().length).toBe(before);
    expect(
      await isolatedBackground.readStorage(EExtStorageKey.HISTORY_START_TIME)
    ).toBeUndefined();
  });

  /** Opened by the background worker, so the popup closing cannot cut it short. */
  test('keeps opening the batch after the popup has closed', async ({
    isolatedBackground,
  }) => {
    const { context } = isolatedBackground;
    const popup = await isolatedBackground.openPopup();
    const urls = [TEST_SITES.EXAMPLE_COM, TEST_SITES.EXAMPLE_ORG];
    const opened: Page[] = [];
    context.on('page', (page) => opened.push(page));

    await sendMessage(popup, { key: 'openLinksInTabs', urls });
    await popup.close();

    try {
      // Opens are paced a second apart, so the second one lands after the close
      await expect
        .poll(() => opened.map((page) => page.url()), {
          timeout: TEST_TIMEOUTS.PAGE_OPEN,
        })
        .toEqual(urls.map((url) => new URL(url).href));
    } finally {
      await Promise.all(opened.map(async (page) => page.close()));
    }
  });

  test('survives a url the browser refuses to open', async ({
    isolatedBackground,
  }) => {
    const popup = await isolatedBackground.openPopup();

    await recordCreatedTabs(popup);
    await sendMessage(popup, {
      key: 'openLinksInTabs',
      urls: ['javascript:void(0)', TEST_SITES.EXAMPLE_NET],
    });

    await expect
      .poll(() => getRecordedTabs(popup), { timeout: TEST_TIMEOUTS.PAGE_OPEN })
      .toEqual([{ url: new URL(TEST_SITES.EXAMPLE_NET).href, active: false }]);
  });
});
