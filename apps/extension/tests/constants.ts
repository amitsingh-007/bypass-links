export { TEST_AUTH_DATA_KEY } from '../src/constants';

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
  AURELIAN:
    'Aurelian Thaddeus Montgomery Everheart-Winchester Delacroix Van Albrecht IV',
} as const;

/**
 * Name of the test person created and deleted during E2E tests.
 */
export const TEST_PERSON_NAME = 'E2E Test Person';

/**
 * Known redirection rule aliases in the test account
 */
export const TEST_SHORTCUTS = {
  GOOGLE: 'http://g/',
  MANTINE: 'http://c/',
  TWITCH: 'http://t/',
  YOUTUBE: 'http://y/',
} as const;

/**
 * Test redirection rule for create/delete tests.
 */
export const TEST_SHORTCUT = {
  ALIAS: 'e2e-test-alias',
  WEBSITE: 'https://example.com',
} as const;

/**
 * Test websites for history tracking tests
 */
export const TEST_SITES = {
  EXAMPLE_COM: 'https://example.com',
  EXAMPLE_ORG: 'https://example.org',
  EXAMPLE_NET: 'https://example.net',
} as const;

/**
 * Default rule alias that indicates an incomplete rule.
 */
export const DEFAULT_RULE_ALIAS = 'http://///';

/**
 * Timeout constants used across test files to avoid magic numbers.
 */
export const TEST_TIMEOUTS = {
  DEBOUNCE: 300,
  PAGE_LOAD: 500,
  NAVIGATION: 1000,
  IMAGE_LOAD: 5000,
  LONG_WAIT: 10_000,
  PAGE_OPEN: 15_000,
  UPLOAD: 30_000,
} as const;
