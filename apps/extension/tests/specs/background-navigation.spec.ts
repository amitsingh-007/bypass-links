import { TEST_SHORTCUTS, TEST_SITES } from '@bypass/shared/tests';
import type { Page } from '@playwright/test';

import { EExtStorageKey } from '@/constants';

import { test, expect } from '../fixtures/background-fixture';

const allInputsAutocompleteOff = async (page: Page) => {
  return page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')];
    if (inputs.length === 0) {
      return false;
    }

    for (const input of inputs) {
      if (input.getAttribute('autocomplete') !== 'off') {
        return false;
      }
    }

    return true;
  });
};

test.describe.serial('Background Service Worker Navigation', () => {
  test('navigating to BROWSERTEST while active redirects to html5test.com', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect.poll(() => page.url()).toContain('https://html5test.com');
    } finally {
      await page.close();
    }
  });

  test('redirect path creates historyStartTime when missing', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect.poll(() => page.url()).toContain('https://html5test.com');

      await expect
        .poll(async () =>
          sharedBackground.readStorage<number>(
            EExtStorageKey.HISTORY_START_TIME
          )
        )
        .toBeDefined();
    } finally {
      await page.close();
    }
  });

  test('reloading BROWSERTEST still redirects through webNavigation reload path', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect.poll(() => page.url()).toContain('https://html5test.com');

      // Reloading mid-navigation detaches the page target
      await page.waitForLoadState('domcontentloaded');
      await page.reload({ waitUntil: 'domcontentloaded' });

      await expect.poll(() => page.url()).toContain('https://html5test.com');
    } finally {
      await page.close();
    }
  });

  test('https://bt alias still resolves via normalized shortcut lookup', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();

    const page = await sharedBackground.openTab('https://bt/');
    try {
      await expect.poll(() => page.url()).toContain('https://html5test.com');
    } finally {
      await page.close();
    }
  });

  test('navigating to TODOMVC applies autocomplete=off to page inputs', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.TODOMVC);
    try {
      await expect.poll(() => page.url()).toContain(TEST_SITES.TODOMVC);

      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);
    } finally {
      await page.close();
    }
  });

  test('reloading TODOMVC still applies autocomplete suppression', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.TODOMVC);
    try {
      await expect.poll(() => page.url()).toContain(TEST_SITES.TODOMVC);

      // Reloading mid-navigation detaches the page target
      await page.waitForLoadState('domcontentloaded');
      await page.reload({ waitUntil: 'domcontentloaded' });

      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);
    } finally {
      await page.close();
    }
  });

  test('redirect path does not overwrite existing historyStartTime', async ({
    sharedBackground,
  }) => {
    const existingHistoryStartTime = 1_700_000_000_000;
    await sharedBackground.ensureActiveState();
    await sharedBackground.setHistoryStartTime(existingHistoryStartTime);

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect
        .poll(async () =>
          sharedBackground.readStorage<number>(
            EExtStorageKey.HISTORY_START_TIME
          )
        )
        .toBe(existingHistoryStartTime);
    } finally {
      await page.close();
    }
  });

  test('unmatched normal URL does not redirect or create historyStartTime', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openLoadedTab(TEST_SITES.EXAMPLE_COM);
    try {
      expect(page.url()).toContain(TEST_SITES.EXAMPLE_COM);

      const historyStartTime = await sharedBackground.readStorage<number>(
        EExtStorageKey.HISTORY_START_TIME
      );
      expect(historyStartTime).toBeUndefined();
    } finally {
      await page.close();
    }
  });

  test('navigating to BROWSERTEST while inactive does not redirect', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureInactiveState();
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect
        .poll(() => page.url())
        .not.toContain('https://html5test.com');

      const historyStartTime = await sharedBackground.readStorage<number>(
        EExtStorageKey.HISTORY_START_TIME
      );
      expect(historyStartTime).toBeUndefined();
    } finally {
      await page.close();
    }
  });

  test('restricted extension URLs do not trigger redirect logic', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await sharedBackground.clearHistoryStartTime();

    const extensionUrl = `chrome-extension://${sharedBackground.extensionId}/popup.html`;
    const page = await sharedBackground.openTab(extensionUrl);
    try {
      await expect.poll(() => page.url()).toContain(extensionUrl);

      const historyStartTime = await sharedBackground.readStorage<number>(
        EExtStorageKey.HISTORY_START_TIME
      );
      expect(historyStartTime).toBeUndefined();
    } finally {
      await page.close();
    }
  });

  test('pages with no inputs are handled safely by turnOffInputSuggestions', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openLoadedTab(TEST_SITES.EXAMPLE_COM);
    try {
      const inputCount = await page.evaluate(() => {
        return document.querySelectorAll('input').length;
      });
      expect(inputCount).toBe(0);

      expect(page.url()).toContain(TEST_SITES.EXAMPLE_COM);

      const historyStartTime = await sharedBackground.readStorage<number>(
        EExtStorageKey.HISTORY_START_TIME
      );
      expect(historyStartTime).toBeUndefined();
    } finally {
      await page.close();
    }
  });

  test('invalid URLs do not trigger redirect logic', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await sharedBackground.clearHistoryStartTime();

    const invalidUrls = [
      'https://chromewebstore.google.com',
      'data:text/plain,test-data-url',
      'file:///tmp/bypass-links-test.html',
    ];

    for (const invalidUrl of invalidUrls) {
      const page = await sharedBackground.openTab(invalidUrl);
      try {
        await expect.poll(() => page.url()).not.toContain('html5test.com');
      } finally {
        await page.close();
      }
    }

    const historyStartTime = await sharedBackground.readStorage<number>(
      EExtStorageKey.HISTORY_START_TIME
    );
    expect(historyStartTime).toBeUndefined();
  });

  test('repeated sequential BROWSERTEST navigations continue redirecting', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();

    for (let attempt = 0; attempt < 3; attempt++) {
      const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
      try {
        await expect.poll(() => page.url()).toContain('https://html5test.com');
      } finally {
        await page.close();
      }
    }
  });
});
