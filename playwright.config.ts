import type { PlaywrightTestConfig } from '@playwright/test';

const ciBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
const isCI = Boolean(ciBaseUrl);

const config: PlaywrightTestConfig = {
  globalTimeout: 30 * 60 * 1000,
  expect: { timeout: 5000 },
  forbidOnly: isCI,
  retries: 2,
  fullyParallel: true,
  reporter: [['github'], ['html', { open: isCI ? 'never' : 'always' }]],
  use: {
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'retain-on-failure',
    headless: true,
    baseURL: ciBaseUrl || 'http://localhost:3000',
    channel: 'chrome',
  },
  projects: [
    {
      name: '@bypass/web',
      testDir: './apps/web/tests/',
    },
  ],
};

export default config;
