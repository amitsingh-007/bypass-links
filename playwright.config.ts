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
  workers: isCI ? 1 : undefined,
  fullyParallel: true,
  reporter: isCI ? [['github']] : [['list'], ['html', { open: 'never' }]],
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
      testIgnore: ['**/auth.setup.ts', 'specs/**/*'],
      use: {
        baseURL: ciBaseUrl ?? 'http://localhost:3000',
      },
    },
    /**
     * Web App Setup: Runs once per test run to authenticate and cache storage.
     * This avoids repeating the login flow and data sync for every test.
     */
    {
      name: 'web-auth-setup',
      testMatch: 'auth.setup.ts',
      testDir: './apps/web/tests',
    },
    /**
     * Web App Tests with Auth: Run with authenticated session.
     * Each spec file gets an isolated copy of the authenticated browser context.
     */
    {
      name: '@bypass/web-with-auth',
      testDir: './apps/web/tests/specs',
      dependencies: ['web-auth-setup'],
      teardown: 'web-teardown',
      use: {
        baseURL: ciBaseUrl ?? 'http://localhost:3000',
      },
    },
    /**
     * Web App Teardown: Cleans up the .cache directory after all tests in the project complete.
     */
    {
      name: 'web-teardown',
      testMatch: 'global-teardown.ts',
      testDir: './apps/web/tests',
    },
    /**
     * Extension Setup: Runs once per test run to authenticate and cache storage/profile.
     * This avoids repeating the login flow and data sync for every specimen.
     */
    {
      name: 'extension-setup',
      testMatch: 'auth.setup.ts',
      testDir: './apps/extension/tests',
    },
    /**
     * Extension Tests: Run in parallel across spec files.
     * Each spec file gets an isolated copy of the authenticated Chrome profile.
     */
    {
      name: '@bypass/extension',
      testDir: './apps/extension/tests/specs',
      dependencies: ['extension-setup'],
      teardown: 'extension-teardown',
      use: {
        baseURL: 'chrome-extension://chadipececickdfjckjkjpehlhnkclmb',
      },
    },
    /**
     * Extension Teardown: Cleans up the .cache directory after all tests in the project complete.
     */
    {
      name: 'extension-teardown',
      testMatch: 'global-teardown.ts',
      testDir: './apps/extension/tests',
    },
  ],
});

export default config;
