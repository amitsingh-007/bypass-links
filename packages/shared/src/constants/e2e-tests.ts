import path from 'node:path';

export const AUTH_CACHE_DIR = path.join('.playwright', '.cache');
export const WEB_STORAGE_PATH = path.join(AUTH_CACHE_DIR, 'web-storage.json');
export const EXTENSION_STORAGE_PATH = path.join(
  AUTH_CACHE_DIR,
  'extension-storage.json'
);
export const CHROME_PROFILE_DIR = path.join(AUTH_CACHE_DIR, 'chrome-profile');

export const TEST_BOOKMARKS = {
  REACT_DOCS: 'Bottom Navigation React component - Material-UI1',
  GITHUB: 'React ButtonGroup component 2',
} as const;

export const TEST_BOOKMARK_URLS = {
  REACT_DOCS: 'https://material-ui.com/components/bottom-navigation/',
} as const;

export const TEST_FOLDERS = {
  MAIN: 'Main',
  EMPTY: 'Empty folder',
  OTHER_BOOKMARKS: 'Other bookmarks',
} as const;

/** Bookmark titles the test account holds in each folder, in listing order. */
export const TEST_FOLDER_BOOKMARKS = {
  ROOT: [TEST_BOOKMARKS.REACT_DOCS, TEST_BOOKMARKS.GITHUB],
  MAIN: ['CRED - pay your credit card bills & earn rewards'],
  OTHER_BOOKMARKS: ['Twitch', 'React Button component'],
} as const;

export const TEST_PERSONS = {
  JOHN_NATHAN: 'John Nathan',
  AKASH_KUMAR_SINGH: 'Akash Kumar Singh',
  DONALD: 'Donald',
} as const;

export const TEST_PERSON_NAME = 'E2E Test Person';

/**
 * Known redirection rule aliases in the test account. One entry per rule that
 * actually exists there: shortcuts.spec asserts the panel's rule count against
 * `Object.keys(TEST_SHORTCUTS).length`, so an unreferenced entry is still load
 * bearing and must not be dropped without removing the rule from the account.
 */
export const TEST_SHORTCUTS = {
  GOOGLE: 'http://g/',
  MANTINE: 'http://c/',
  TWITCH: 'http://t/',
  YOUTUBE: 'http://y/',
  TODOMVC: 'http://hah/',
  BROWSERTEST: 'http://bt/',
} as const;

/** Websites of the account's `isDefault` redirection rules, in rule order. */
export const TEST_DEFAULT_REDIRECTION_URLS = [
  'https://www.google.com/',
  'https://www.mantine.dev/',
] as const;

/**
 * TODOMVC is where TEST_SHORTCUTS.TODOMVC redirects; it renders its input via JS,
 * so it covers the MutationObserver branch of the autocomplete suppression script.
 */
export const TEST_SITES = {
  EXAMPLE_COM: 'https://example.com',
  EXAMPLE_ORG: 'https://example.org',
  EXAMPLE_NET: 'https://example.net',
  TODOMVC: 'https://demo.playwright.dev/todomvc',
} as const;

const padIndex = (index: number) => String(index).padStart(3, '0');

/**
 * Vocabulary for the seeded lists both apps' large-list specs build. The size is
 * well past what any panel viewport can hold, so a rendered subset is proof.
 */
export const TEST_LARGE_LIST = {
  SIZE: 150,
  SEARCHED_INDEX: 75,
  bookmarkTitle: (index: number) => `Large Bookmark ${padIndex(index)}`,
  bookmarkUrl: (index: number) =>
    `${TEST_SITES.EXAMPLE_COM}/large/${padIndex(index)}`,
  personName: (index: number) => `Large Person ${padIndex(index)}`,
} as const;

export const TEST_TIMEOUTS = {
  NAVIGATION: 1000,
  PAGE_OPEN_ATTEMPT: 2000,
  LONG_WAIT: 10_000,
  PAGE_OPEN: 15_000,
  AUTH: 30_000,
  /** A whole sign-in and preload cycle, twice over. */
  AUTH_LIFECYCLE: 90_000,
} as const;
