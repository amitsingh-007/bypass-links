import fs from 'node:fs';
import { test as teardown } from '@playwright/test';
import { AUTH_CACHE_DIR } from './auth-constants';

teardown('clean up cache directory', async () => {
  // Clean up the cache directory after all tests complete
  await fs.promises.rm(AUTH_CACHE_DIR, { recursive: true, force: true });
});
