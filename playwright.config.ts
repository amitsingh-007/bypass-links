import type { PlaywrightTestConfig } from '@playwright/test';
import path from 'node:path';

const ciBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
const isCI = Boolean(ciBaseUrl);

const config: PlaywrightTestConfig = {
  globalTimeout: 30 * 60 * 1000,
  expect: { timeout: 5000 },
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  fullyParallel: true,
  reporter: [['github'], ['html', { open: isCI ? 'never' : 'always' }]],
  globalSetup: path.resolve('./scripts/global-teardown'),
  use: {
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'retain-on-failure',
    headless: true,
    channel: 'chrome',
  },
  projects: [
    {
      name: '@bypass/web',
      testDir: './apps/web/tests',
      use: {
        baseURL: ciBaseUrl || 'http://localhost:3000',
      },
    },
    {
      name: '@bypass/extension',
      testDir: './apps/extension/tests',
      use: {
        baseURL: 'chrome-extension://chadipececickdfjckjkjpehlhnkclmb',
      },
    },
  ],
};

export default config;
