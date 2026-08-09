import { removeAuthCacheDir } from '@bypass/shared/tests';
import { test as teardown } from '@playwright/test';

import { AUTH_CACHE_DIR } from './auth-constants';

teardown('clean up cache directory', async () => {
  await removeAuthCacheDir(AUTH_CACHE_DIR);
});
