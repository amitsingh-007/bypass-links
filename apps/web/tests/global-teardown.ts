import { test as teardown } from '@playwright/test';
import { AUTH_CACHE_DIR } from './auth-constants';
import { rmDirWithRetry } from './utils/fs-utils';

teardown('clean up cache directory', async () => {
  // Clean up the cache directory after all tests complete
  await rmDirWithRetry(AUTH_CACHE_DIR);
});
