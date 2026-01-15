import path from 'node:path';
import process from 'node:process';
import { defineConfig } from '@playwright/test';

process.loadEnvFile(path.join(process.cwd(), '.env'));

const ciBaseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL;
const isCI = Boolean(ciBaseUrl);

const config = defineConfig({
  globalTimeout: 30 * 60 * 1000,
  expect: { timeout: 5000 },
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  fullyParallel: true,
  reporter: [['github'], ['html', { open: 'never' }]],
  use: {
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    trace: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: '@bypass/web',
      testDir: './apps/web/tests',
      use: {
        baseURL: ciBaseUrl ?? 'http://localhost:3000',
      },
    },
    {
      name: '@bypass/extension',
      testDir: './apps/extension/tests',
      workers: 1,
      use: {
        baseURL: 'chrome-extension://chadipececickdfjckjkjpehlhnkclmb',
      },
    },
  ],
});

export default config;
