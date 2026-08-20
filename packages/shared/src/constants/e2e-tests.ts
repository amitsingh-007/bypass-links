/**
 * Known bookmark titles in the test account
 */
export const TEST_BOOKMARKS = {
  REACT_DOCS: 'Bottom Navigation React component - Material-UI1',
  GITHUB: 'React ButtonGroup component 2',
} as const;

/**
 * Known folder names in the test account.
 */
export const TEST_FOLDERS = {
  MAIN: 'Main',
  EMPTY: 'Empty folder',
  OTHER_BOOKMARKS: 'Other bookmarks',
} as const;

/**
 * Known person names in the test account
 */
export const TEST_PERSONS = {
  JOHN_NATHAN: 'John Nathan',
  AKASH_KUMAR_SINGH: 'Akash Kumar Singh',
  DONALD: 'Donald',
} as const;

/**
 * Name of the test person created and deleted during E2E tests.
 */
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
  // Rules for background tests
  TODOMVC: 'http://hah/',
  BROWSERTEST: 'http://bt/',
} as const;

/**
 * Real websites navigated to by E2E specs.
 * TODOMVC is where TEST_SHORTCUTS.TODOMVC redirects. It renders its input via
 * JS, so it covers the MutationObserver branch of the autocomplete suppression
 * script.
 */
export const TEST_SITES = {
  EXAMPLE_COM: 'https://example.com',
  EXAMPLE_ORG: 'https://example.org',
  EXAMPLE_NET: 'https://example.net',
  TODOMVC: 'https://demo.playwright.dev/todomvc',
} as const;

/**
 * Timeout constants used across test files to avoid magic numbers.
 */
export const TEST_TIMEOUTS = {
  NAVIGATION: 1000,
  PAGE_OPEN_ATTEMPT: 2000,
  LONG_WAIT: 10_000,
  PAGE_OPEN: 15_000,
  AUTH: 30_000,
} as const;
