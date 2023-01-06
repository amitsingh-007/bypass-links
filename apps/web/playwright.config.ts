import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const isDev = process.env.VERCEL_ENV === 'development';

console.log('ci env', process.env.VERCEL_ENV);
console.log('ci base url', process.env.PLAYWRIGHT_TEST_BASE_URL);

const config: PlaywrightTestConfig = {
  globalTimeout: 30 * 60 * 1000,
  testDir: './tests',
  expect: { timeout: 5000 },
  forbidOnly: !isDev,
  retries: 2,
  fullyParallel: true,
  reporter: [['github'], ['html', { open: isDev ? 'always' : 'never' }]],
  use: {
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'retain-on-failure',
    headless: true,
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  },
  projects: [
    {
      name: 'Google Chrome',
      use: { channel: 'chrome' },
    },
  ],
};

export default config;
