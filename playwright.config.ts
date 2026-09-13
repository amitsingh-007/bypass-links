import path from 'node:path';
import process from 'node:process';

import { loadRootEnv } from '@bypass/configs/env';
import { WEB_STORAGE_PATH } from '@bypass/shared/tests';
import { defineConfig } from '@playwright/test';

loadRootEnv();

const ciBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
const isCI = Boolean(ciBaseUrl);
const ARTIFACTS_DIR = '.playwright';

const config = defineConfig({
  globalTeardown: './tests/coverage-report.ts',
  forbidOnly: isCI,
  retries: 1,
  workers: isCI ? '75%' : undefined,
  fullyParallel: true,
  outputDir: path.join(ARTIFACTS_DIR, 'test-results'),
  reporter: [
    isCI ? ['github'] : ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: path.join(ARTIFACTS_DIR, 'playwright-report'),
      },
    ],
  ],
  use: {
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'retain-on-failure',
  },
  projects: [
    /** Authenticates once per run and caches web storage state and the extension Chrome profile. */
    {
      name: 'auth-setup',
      testDir: './apps',
      testMatch: '**/tests/auth.setup.ts',
    },
    {
      name: '@bypass/web-with-auth',
      testDir: './apps/web/tests/specs',
      dependencies: ['auth-setup'],
      use: {
        baseURL: ciBaseUrl ?? 'http://localhost:3000',
        storageState: WEB_STORAGE_PATH,
      },
    },
    /** Each spec file gets an isolated copy of the authenticated Chrome profile. */
    {
      name: '@bypass/extension',
      testDir: './apps/extension/tests/specs',
      dependencies: ['auth-setup'],
      use: {
        baseURL: 'chrome-extension://chadipececickdfjckjkjpehlhnkclmb',
      },
    },
  ],
});

export default config;
