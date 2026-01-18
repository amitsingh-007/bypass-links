import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { test as teardown } from '@playwright/test';

const AUTH_CACHE_DIR = path.join(process.cwd(), '.cache');

teardown('clean up cache directory', async () => {
  // Clean up the cache directory after all tests complete
  if (
    await fs.promises
      .access(AUTH_CACHE_DIR)
      .then(() => true)
      .catch(() => false)
  ) {
    await fs.promises.rm(AUTH_CACHE_DIR, { recursive: true, force: true });
  }
});
