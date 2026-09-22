import { loadRootEnv } from '@bypass/configs/env';
import { defineConfig } from '@playwright/test';

loadRootEnv();

/**
 * Product shots run from their own config so `pnpm e2e` never captures them.
 * They use the extension dev build, which serves its popup from the WXT dev
 * server, and sign-in that talks to the web app's tRPC API; both dev servers
 * are started here and reused if they are already running.
 */
export default defineConfig({
  globalTeardown: './coverage-report.ts',
  testDir: '.',
  outputDir: '../.playwright/test-results',
  reporter: [['list']],
  workers: 1,
  use: {
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
  },
  webServer: [
    {
      command: 'pnpm --filter @bypass/web dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter @bypass/extension dev',
      url: 'http://localhost:3001/@vite/client',
      reuseExistingServer: true,
      timeout: 120 * 1000,
    },
  ],
  projects: [
    {
      name: 'auth-setup',
      testDir: '../apps',
      testMatch: '**/extension/tests/auth.setup.ts',
    },
    {
      name: 'landing-shots',
      testMatch: 'landing-shots.ts',
      dependencies: ['auth-setup'],
    },
  ],
});
