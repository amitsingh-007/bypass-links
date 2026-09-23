// Helpers inside `page.evaluate` run in the browser, so they cannot be hoisted
// oxlint-disable unicorn/consistent-function-scoping
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  TEST_BOOKMARK_URLS,
  TEST_BOOKMARKS,
  TEST_FOLDER_BOOKMARKS,
  TEST_FOLDERS,
  TEST_PERSON_NAME,
  TEST_PERSONS,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import { expect, type Page, test } from '@playwright/test';

import { MAX_PANEL_SIZE } from '../apps/extension/src/constants';
import {
  abortAccountWrites,
  createSharedBackgroundSW,
  getExtensionId,
  openExtensionPanelPage,
  withTempProfileContext,
} from '../apps/extension/tests/fixtures/base-fixture';
import { seedFolderWithBookmarks } from '../apps/extension/tests/utils/test-utils';

const SHOTS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../apps/web/public/shots'
);

const PANEL_VIEWPORT = {
  width: MAX_PANEL_SIZE.WIDTH,
  height: MAX_PANEL_SIZE.HEIGHT,
};

// Added to the account's five root rows, fills the root view to ten
const SEEDED_FOLDER_COUNT = 5;

const PLACEHOLDERS = {
  folders: [
    'Reading list',
    'Design inspiration',
    'Recipes to try',
    'Weekend projects',
    'Work notes',
    'Travel plans',
    'Gift ideas',
    'Music to explore',
    'Home office',
    'Learning Rust',
    'Garden notes',
    'Photo edits',
  ],
  titles: [
    'How to brew better coffee at home',
    'A field guide to CSS grid',
    'The quiet art of writing clearly',
    'Building a small home server',
    'Why good typography goes unnoticed',
    'Twelve hikes worth the early start',
    'A short history of the keyboard',
    'Notes on reading more slowly',
    'The case for boring software',
    'A beginner guide to sourdough',
    'Mapping the night sky by hand',
    'Small habits for a tidy desk',
  ],
  people: [
    'Maya Chen',
    'Leo Alvarez',
    'Nina Patel',
    'Omar Haddad',
    'Iris Novak',
    'Theo Brandt',
    'Ada Lorenz',
    'Ravi Menon',
  ],
} as const;

/**
 * Replaces every piece of user-generated content in the rendered panel, so the
 * committed Product shots carry nothing from the test account. Avatars are
 * rebuilt rather than re-pointed: a real photo must not survive a failed swap.
 */
const sanitizePage = (page: Page) =>
  page.evaluate((names) => {
    const colors = [
      '#7c3aed',
      '#ef6351',
      '#2563eb',
      '#0d9488',
      '#d97706',
      '#db2777',
    ];
    const pick = <T>(list: readonly T[], index: number) =>
      list[index % list.length];

    const initials = (name: string) =>
      name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const fillAvatar = (
      avatar: Element,
      label: string,
      index: number,
      isRound = true
    ) => {
      const image = document.createElement('img');
      image.setAttribute('alt', '');
      image.setAttribute(
        'src',
        `data:image/svg+xml;utf8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="${pick(colors, index)}"/><text x="48" y="52" fill="#ffffff" font-family="Manrope, Arial, sans-serif" font-size="${label.length > 1 ? 34 : 44}" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
        )}`
      );
      image.className = avatar.querySelector('img')?.className ?? '';
      image.style.width = '100%';
      image.style.height = '100%';
      image.style.objectFit = 'cover';
      image.style.borderRadius = isRound ? '50%' : '0';
      avatar.replaceChildren(image);
    };

    const fillAvatars = (
      root: Element,
      label: string,
      index: number,
      isRound = true
    ) =>
      root
        .querySelectorAll('[data-slot="avatar"]')
        .forEach((avatar) => fillAvatar(avatar, label, index, isRound));

    /** Every text node, so nothing user-written can hide in a nested node. */
    const setRowText = (row: Element, text: string) => {
      const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT);
      const nodes: Node[] = [];
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.nodeValue?.trim()) {
          nodes.push(node);
        }
      }
      nodes.forEach((node, index) => {
        node.nodeValue = index === 0 ? text : '';
      });
      if (row.hasAttribute('title')) {
        row.setAttribute('title', text);
      }
      row.querySelectorAll('[title]').forEach((element) => {
        element.setAttribute('title', text);
      });
    };

    const anonymiseTestIds = (prefix: string) =>
      document
        .querySelectorAll(`[data-testid^="${prefix}-"]`)
        .forEach((element) => element.setAttribute('data-testid', prefix));

    document.querySelectorAll('[data-context-id]').forEach((element) => {
      element.removeAttribute('data-context-id');
    });

    document
      .querySelectorAll('[data-testid^="folder-item-"]')
      .forEach((row, index) => setRowText(row, pick(names.folders, index)));

    document
      .querySelectorAll('[data-testid^="bookmark-item-"]')
      .forEach((row, index) => {
        const title = pick(names.titles, index);
        row
          .querySelectorAll(
            '[data-slot="avatar"]:not([data-testid="bookmark-favicon"])'
          )
          .forEach((avatar, avatarIndex) =>
            fillAvatar(
              avatar,
              initials(pick(names.people, index + avatarIndex)),
              index + avatarIndex
            )
          );
        const favicon = row.querySelector('[data-testid="bookmark-favicon"]');
        if (favicon) {
          fillAvatar(favicon, title.slice(0, 1).toUpperCase(), index);
        }
        setRowText(row, title);
      });

    document
      .querySelectorAll('[data-testid^="person-item-"]')
      .forEach((card, index) => {
        const name = pick(names.people, index);
        fillAvatars(card, initials(name), index, false);
        setRowText(card, name);
      });

    document
      .querySelectorAll('[data-testid="folder-name-badge"]')
      .forEach((badge, index) => setRowText(badge, pick(names.folders, index)));

    // Whatever is left: the signed-in user's avatar, and any avatar outside a row
    document
      .querySelectorAll('[data-slot="avatar"]')
      .forEach((avatar, index) => {
        if (!avatar.querySelector('img[src^="data:image/svg+xml"]')) {
          fillAvatar(avatar, initials(pick(names.people, index)), index);
        }
      });

    [
      'folder-item',
      'bookmark-item',
      'bookmark-title',
      'person-item',
      'person-dropdown',
      'dropdown-avatar',
    ].forEach(anonymiseTestIds);
    // Not by prefix: `avatar-group` carries no name and must keep its test id
    document
      .querySelectorAll('[data-slot="avatar"][data-testid^="avatar-"]')
      .forEach((avatar) => avatar.setAttribute('data-testid', 'avatar'));
  }, PLACEHOLDERS);

/**
 * Avatars load late and re-render over the rewrite, so the shot is only taken
 * once the panel has settled, and what was on screen is checked afterwards.
 */
const capture = async (page: Page, name: string, rootSelector?: string) => {
  await page.waitForTimeout(TEST_TIMEOUTS.PAGE_OPEN_ATTEMPT);
  await sanitizePage(page);
  const file = path.join(SHOTS_DIR, `${name}.png`);
  await (rootSelector
    ? page
        .locator(rootSelector)
        .screenshot({ path: file, omitBackground: true })
    : page.screenshot({ path: file }));

  const leaks = await page.evaluate(
    (realValues) => ({
      images: [...document.querySelectorAll('img')]
        .map((image) => image.getAttribute('src') ?? '')
        .filter((src) => !src.startsWith('data:image/svg+xml')),
      text: realValues.filter((value) =>
        document.body.innerText.includes(value)
      ),
    }),
    [
      ...Object.values(TEST_FOLDERS),
      ...Object.values(TEST_BOOKMARKS),
      ...Object.values(TEST_BOOKMARK_URLS),
      ...Object.values(TEST_FOLDER_BOOKMARKS).flat(),
      ...Object.values(TEST_PERSONS),
      TEST_PERSON_NAME,
    ]
  );
  expect(leaks, `user-generated content survived in ${name}.png`).toEqual({
    images: [],
    text: [],
  });
};

test('capture landing Product shots', async () => {
  test.setTimeout(TEST_TIMEOUTS.AUTH_LIFECYCLE * 2);

  await withTempProfileContext(
    {
      seedFromCachedProfile: true,
      deviceScaleFactor: 2,
      viewport: PANEL_VIEWPORT,
    },
    async (context) => {
      const sawAccountWrite = await abortAccountWrites(context);
      const extensionId = await getExtensionId(
        await createSharedBackgroundSW(context)
      );

      const popup = await openExtensionPanelPage(context, extensionId);
      await capture(popup, 'popup', '#root');

      for (let index = 0; index < SEEDED_FOLDER_COUNT; index += 1) {
        await seedFolderWithBookmarks(popup, `Shot folder ${index}`, [
          {
            title: `Shot bookmark ${index}`,
            url: `https://example.com/${index}`,
          },
        ]);
      }

      const bookmarks = await openExtensionPanelPage(
        context,
        extensionId,
        'bookmarks'
      );
      await bookmarks
        .locator('[data-testid^="bookmark-item-"]')
        .first()
        .waitFor({ timeout: TEST_TIMEOUTS.PAGE_OPEN });
      // The panel button click leaves the pointer hovering a row
      await bookmarks.mouse.move(
        PANEL_VIEWPORT.width / 2,
        PANEL_VIEWPORT.height - 1
      );
      await capture(bookmarks, 'bookmarks');

      expect(
        sawAccountWrite(),
        'a panel save reached the shared test account'
      ).toBe(false);
    }
  );
});
