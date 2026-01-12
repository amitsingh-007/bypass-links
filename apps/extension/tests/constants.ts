/**
 * LocalStorage key used to inject test auth data during Playwright tests.
 * This is read by the Firebase store to bypass the normal auth flow.
 */
export const TEST_AUTH_DATA_KEY = '__test_auth_data';

/**
 * Known bookmark titles in the test account (guaranteed to exist).
 * These can be used for precise selectors instead of .first()
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
 * Known person names in the test account (guaranteed to exist).
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
