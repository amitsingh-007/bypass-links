/* eslint-disable react-hooks/rules-of-hooks */
import { type BrowserContext, type Page, type Worker } from '@playwright/test';
import { authenticateAndNavigate } from './base-fixture';
import { test as base } from './extension-base-fixture';

export const test = base.extend<
  {
    personsPage: Page;
    context: BrowserContext;
  },
  {
    sharedPage: Page;
    _sharedBackgroundSW: Worker;
  }
>({
  // Include sharedBackgroundSW in worker scope to pass to authenticateAndNavigate
  _sharedBackgroundSW: [
    async ({ sharedBackgroundSW }, use) => {
      await use(sharedBackgroundSW);
    },
    { scope: 'worker' },
  ],

  sharedPage: [
    async ({ sharedContext, sharedExtensionId, _sharedBackgroundSW }, use) => {
      const page = await authenticateAndNavigate(
        sharedContext,
        sharedExtensionId,
        'persons',
        _sharedBackgroundSW
      );
      await use(page);
    },
    { scope: 'worker' },
  ],

  async personsPage({ sharedPage }, use) {
    await use(sharedPage);
  },

  async context({ sharedContext }, use) {
    await use(sharedContext);
  },
});

export { expect } from './extension-base-fixture';
