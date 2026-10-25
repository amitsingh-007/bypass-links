import {
  TEST_SHORTCUTS,
  TEST_SITES,
  TEST_TIMEOUTS,
} from '@bypass/shared/tests';
import type { Page, Route } from '@playwright/test';

import { EExtensionState, EExtStorageKey } from '@/constants';
import { isValidUrl } from '@/entrypoints/background/utils';

import {
  test,
  expect,
  observeNativeRedirects,
} from '../fixtures/background-fixture';
import { getRedirectionStorage } from '../utils/test-utils';

/** Any https origin will do; `scripting.executeScript` just refuses the fake schemes. */
const FIXTURE_ORIGIN = 'https://navigation.test';

const abortRoute = async (route: Route) => route.abort();
const emptyPageRoute = async (route: Route) =>
  route.fulfill({ contentType: 'text/html', body: '' });

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

test('URL validation ignores malformed input and retains navigation exclusions', () => {
  for (const url of [
    undefined,
    '',
    'not a URL',
    '/relative',
    'http://',
    'https://[broken',
    'https://example.com:bad-port/',
    'ftp://example.com/',
    'data:text/plain,test',
    'file:///tmp/test.html',
    'chrome-extension://test/popup.html',
    'https://chrome.google.com/',
    'https://chromewebstore.google.com/',
    'https://microsoftedge.microsoft.com/',
    'https://addons.mozilla.org/',
  ]) {
    expect(isValidUrl(url), String(url)).toBe(false);
  }
  for (const url of ['http://example.com/', 'https://example.com/']) {
    expect(isValidUrl(url), url).toBe(true);
  }
});

test.describe.serial('Background Service Worker Navigation', () => {
  test('redirects http and https aliases natively and Back returns to the previous page', async ({
    isolatedBackground,
  }) => {
    const alias = 'http://e2e-native/';
    const target = 'https://native-target.test/';
    const previous = 'https://native-target.test/previous';
    await isolatedBackground.context.route(
      'https://native-target.test/**',
      emptyPageRoute
    );
    await isolatedBackground.context.route(
      'http://e2e-native/**',
      emptyPageRoute
    );
    await isolatedBackground.context.route(
      'https://e2e-native/**',
      emptyPageRoute
    );
    await isolatedBackground.writeStorage(
      getRedirectionStorage([
        { id: 'native-rule', alias, website: target, isDefault: false },
      ])
    );
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);
    const page = await isolatedBackground.openLoadedTab(previous);
    const native = await observeNativeRedirects(page);
    try {
      for (const url of [alias, 'https://e2e-native/']) {
        await page.goto(url);
        expect(page.url()).toBe(target);
        await expect
          .poll(() => native.redirects)
          .toContainEqual({ from: url, to: target, status: 307 });
        await page.goBack();
        expect(page.url()).toBe(previous);
      }
    } finally {
      await native.close();
      await page.close();
    }
  });

  test('skips invalid targets and fragment aliases while valid Unicode shortcuts stay exact and main-frame only', async ({
    isolatedBackground,
  }) => {
    const alias = 'http://例子.test/资料?Value=李';
    const canonicalAlias = new URL(alias).href;
    const target = new URL('https://native-target.test/李?q=📚').href;
    const fragmentAlias = 'http://fragment-alias.test/#section';
    await isolatedBackground.context.route(
      'https://native-target.test/**',
      emptyPageRoute
    );
    await isolatedBackground.context.route('**/*', async (route) => {
      if (route.request().url().includes('native-target.test'))
        await route.fallback();
      else await emptyPageRoute(route);
    });
    await isolatedBackground.writeStorage(
      getRedirectionStorage([
        {
          id: 'invalid',
          alias: 'http://invalid-target.test/',
          website: 'not a URL',
          isDefault: false,
        },
        {
          id: 'invalid-protocol',
          alias: 'http://invalid-protocol.test/',
          website: 'javascript:alert(1)',
          isDefault: false,
        },
        {
          id: 'fragment',
          alias: fragmentAlias,
          website: target,
          isDefault: false,
        },
        {
          id: 'empty-fragment',
          alias: 'http://empty-fragment-alias.test/#',
          website: target,
          isDefault: false,
        },
        { id: 'valid', alias, website: target, isDefault: false },
      ])
    );
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);
    const page = await isolatedBackground.openLoadedTab(canonicalAlias);
    expect(page.url()).toBe(target);
    await page.goto(canonicalAlias.replace('Value=', 'value='));
    expect(page.url()).not.toBe(target);
    await page.goto(fragmentAlias);
    expect(page.url()).toBe(fragmentAlias);
    await page.close();

    await isolatedBackground.clearHistoryStartTime();
    const frameAlias = canonicalAlias.replace('http:', 'https:');
    const parent = await isolatedBackground.openFixturePage(
      'https://frame-parent.test/',
      `<iframe src="${frameAlias}"></iframe>`
    );
    await expect
      .poll(() => parent.frames().map((frame) => frame.url()))
      .toContain(frameAlias);
    expect(
      await isolatedBackground.readStorage(EExtStorageKey.HISTORY_START_TIME)
    ).toBeUndefined();
    await parent.close();
  });

  test('caps supported native regex rules and ignores an unsupported oversized alias', async ({
    isolatedBackground,
  }) => {
    const warnings: string[] = [];
    isolatedBackground.context.on('console', (message) => {
      if (message.type() === 'warning') warnings.push(message.text());
    });
    const rules = Array.from({ length: 1001 }, (_, index) => ({
      id: `cap-${index}`,
      alias: `http://cap-${index}.test/`,
      website: 'https://native-target.test/',
      isDefault: false,
    }));
    rules.unshift({
      id: 'oversized',
      alias: `http://oversized.test/${'a'.repeat(4000)}`,
      website: 'https://native-target.test/',
      isDefault: false,
    });
    await isolatedBackground.writeStorage(getRedirectionStorage(rules));
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1000);
    const installed = await isolatedBackground.readDynamicRules();
    expect(new Set(installed.map(({ id }) => id)).size).toBe(1000);
    expect(
      installed.some(({ condition }) =>
        condition.regexFilter?.includes('oversized')
      )
    ).toBe(false);
    expect(warnings).toContain(
      'Shortcut rule limit reached; only the first 1000 supported shortcuts are active'
    );
  });

  test('native redirects survive while the background worker is stopped', async ({
    isolatedBackground,
  }) => {
    const alias = 'http://sleeping-shortcut.test/';
    const target = 'https://native-target.test/';
    await isolatedBackground.context.route(target, emptyPageRoute);
    await isolatedBackground.writeStorage(
      getRedirectionStorage([
        { id: 'sleeping', alias, website: target, isDefault: false },
      ])
    );
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);
    const page = await isolatedBackground.context.newPage();
    const native = await observeNativeRedirects(page);
    const session = await isolatedBackground.context.newCDPSession(page);
    try {
      await session.send('ServiceWorker.enable');
      await session.send('ServiceWorker.stopAllWorkers');
      await page.goto(alias);
      expect(page.url()).toBe(target);
      await expect
        .poll(() => native.redirects)
        .toContainEqual({ from: alias, to: target, status: 307 });
    } finally {
      await session.detach();
      await native.close();
      await page.close();
    }
  });

  test('navigating to BROWSERTEST while active redirects to html5test.com', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);
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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect.poll(() => page.url()).toContain('https://html5test.com');

      await expect
        .poll(async () =>
          sharedBackground.readStorage(EExtStorageKey.HISTORY_START_TIME)
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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);
    await sharedBackground.setHistoryStartTime(existingHistoryStartTime);

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect
        .poll(async () =>
          sharedBackground.readStorage(EExtStorageKey.HISTORY_START_TIME)
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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openLoadedTab(TEST_SITES.EXAMPLE_COM);
    try {
      expect(page.url()).toContain(TEST_SITES.EXAMPLE_COM);

      const historyStartTime = await sharedBackground.readStorage(
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
    await expect.poll(() => sharedBackground.readDynamicRules()).toEqual([]);
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect
        .poll(() => page.url())
        .not.toContain('https://html5test.com');

      const historyStartTime = await sharedBackground.readStorage(
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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);
    await sharedBackground.clearHistoryStartTime();

    const extensionUrl = `chrome-extension://${sharedBackground.extensionId}/popup.html`;
    const page = await sharedBackground.openTab(extensionUrl);
    try {
      await expect.poll(() => page.url()).toContain(extensionUrl);

      const historyStartTime = await sharedBackground.readStorage(
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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);
    await sharedBackground.clearHistoryStartTime();

    const page = await sharedBackground.openLoadedTab(TEST_SITES.EXAMPLE_COM);
    try {
      const inputCount = await page.evaluate(() => {
        return document.querySelectorAll('input').length;
      });
      expect(inputCount).toBe(0);

      expect(page.url()).toContain(TEST_SITES.EXAMPLE_COM);

      const historyStartTime = await sharedBackground.readStorage(
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
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);
    await sharedBackground.clearHistoryStartTime();

    // Not Chrome's own store: headless Chrome quits when a tab it served for that origin closes
    const storeUrl = 'https://addons.mozilla.org';
    const invalidUrls = [
      storeUrl,
      'data:text/plain,test-data-url',
      'file:///tmp/bypass-links-test.html',
    ];

    // Closing a tab mid-fetch used to hang this test; the worker only needs the url
    await sharedBackground.context.route(`${storeUrl}/**`, emptyPageRoute);
    try {
      for (const invalidUrl of invalidUrls) {
        await test.step(invalidUrl, async () => {
          const page = await sharedBackground.openTab(invalidUrl);
          try {
            await expect.poll(() => page.url()).not.toContain('html5test.com');
          } finally {
            await page.close();
          }
        });
      }
    } finally {
      await sharedBackground.context.unroute(`${storeUrl}/**`, emptyPageRoute);
    }

    const historyStartTime = await sharedBackground.readStorage(
      EExtStorageKey.HISTORY_START_TIME
    );
    expect(historyStartTime).toBeUndefined();
  });

  test('repeated sequential BROWSERTEST navigations continue redirecting', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

    for (let attempt = 0; attempt < 3; attempt++) {
      await test.step(`attempt ${attempt + 1}`, async () => {
        const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
        try {
          await expect
            .poll(() => page.url())
            .toContain('https://html5test.com');
        } finally {
          await page.close();
        }
      });
    }
  });

  test('suppresses autocomplete on inputs added after the page loaded', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

    const page = await sharedBackground.openFixturePage(
      `${FIXTURE_ORIGIN}/dynamic-inputs`,
      '<input name="present-at-load">'
    );
    try {
      // The observer only exists once the injected script has run
      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);

      await test.step('a bare input', async () => {
        await page.evaluate(() => {
          document.body.append(document.createElement('input'));
        });

        await expect
          .poll(async () => allInputsAutocompleteOff(page))
          .toBe(true);
      });

      await test.step('an input nested inside an added container', async () => {
        await page.evaluate(() => {
          const container = document.createElement('div');
          container.innerHTML = '<section><input name="nested"></section>';
          document.body.append(container);
        });

        await expect
          .poll(async () => allInputsAutocompleteOff(page))
          .toBe(true);
      });
    } finally {
      await page.close();
    }
  });

  /** Re-injection returns early on its own marker, so the first run's observer must still work. */
  test('keeps suppressing across a same-document navigation', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

    const page = await sharedBackground.openFixturePage(
      `${FIXTURE_ORIGIN}/spa`,
      '<input name="present-at-load">'
    );
    try {
      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);

      await page.evaluate(() => {
        history.pushState({}, '', '/spa/next');
        document.body.append(document.createElement('input'));
      });

      await expect.poll(() => page.url()).toContain('/spa/next');
      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);
    } finally {
      await page.close();
    }
  });

  /** Parent completion trails its iframe's, so an iframe must not consume the pending-reload marker. */
  test('an iframe completing does not swallow the main frame reload', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

    const framePath = `${FIXTURE_ORIGIN}/iframe-child`;
    const page = await sharedBackground.openFixturePage(
      `${FIXTURE_ORIGIN}/with-iframe`,
      `<input name="outer"><iframe src="${framePath}"></iframe>`,
      { [framePath]: '<p>child frame</p>' }
    );
    try {
      await page.reload({ waitUntil: 'load' });

      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);
    } finally {
      await page.close();
    }
  });

  /** An aborted reload leaves the pending-reload marker set for the tab. */
  test('a reload that aborts leaves the next reload handled', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

    const url = `${FIXTURE_ORIGIN}/aborted-reload`;
    const page = await sharedBackground.openFixturePage(
      url,
      '<input name="present-at-load">'
    );
    try {
      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);

      // Registered after the fixture's own route, so this one answers first
      await page.route(url, abortRoute);
      await page.reload({ waitUntil: 'commit' }).catch(() => undefined);
      await expect(page.locator('input')).toHaveCount(0);

      await page.unroute(url, abortRoute);
      await page.reload({ waitUntil: 'load' });

      await expect.poll(async () => allInputsAutocompleteOff(page)).toBe(true);
    } finally {
      await page.close();
    }
  });

  /** Each alias navigation must commit the target only once. */
  test('redirects once per alias navigation, not twice', async ({
    isolatedBackground,
  }) => {
    const alias = 'http://e2e-once/';
    await isolatedBackground.writeStorage(
      getRedirectionStorage([
        {
          id: crypto.randomUUID(),
          alias,
          website: TEST_SITES.EXAMPLE_COM,
          isDefault: false,
        },
      ])
    );
    await isolatedBackground.ensureActiveState();
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);

    const page = await isolatedBackground.context.newPage();
    const redirects: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame() && frame.url().includes('example.com')) {
        redirects.push(frame.url());
      }
    });

    try {
      for (const attempt of [1, 2]) {
        await page
          .goto(alias, {
            waitUntil: 'commit',
            timeout: TEST_TIMEOUTS.NAVIGATION,
          })
          .catch(() => undefined);

        await expect
          .poll(() => redirects.length, { timeout: TEST_TIMEOUTS.PAGE_OPEN })
          .toBe(attempt);
      }

      // A duplicate handler would have added its navigation by now
      await expect.poll(() => page.url()).toContain(TEST_SITES.EXAMPLE_COM);
      expect(redirects).toHaveLength(2);
    } finally {
      await page.close();
    }
  });

  test('a tab closed mid-navigation does not stop the next one redirecting', async ({
    sharedBackground,
  }) => {
    await sharedBackground.ensureActiveState();
    await expect
      .poll(() => sharedBackground.readDynamicRules())
      .not.toEqual([]);

    const closing = await sharedBackground.context.newPage();
    const navigationStarted = closing.waitForRequest((request) =>
      request.url().startsWith('https://html5test.com')
    );
    // Deliberately not awaited: the tab has to go while the redirect is in flight
    void closing
      .goto(TEST_SHORTCUTS.BROWSERTEST, { waitUntil: 'commit' })
      .catch(() => undefined);
    await navigationStarted;
    await closing.close();

    const page = await sharedBackground.openTab(TEST_SHORTCUTS.BROWSERTEST);
    try {
      await expect.poll(() => page.url()).toContain('https://html5test.com');
    } finally {
      await page.close();
    }
  });

  /** The worker learns of the switch only via a storage event; resuming proves the skip was real. */
  test('the popup switch stops and resumes redirecting', async ({
    isolatedBackground,
  }) => {
    const alias = 'http://e2e-toggle/';
    await isolatedBackground.writeStorage(
      getRedirectionStorage([
        {
          id: crypto.randomUUID(),
          alias,
          website: TEST_SITES.EXAMPLE_COM,
          isDefault: false,
        },
      ])
    );
    await isolatedBackground.ensureActiveState();
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);
    const popup = await isolatedBackground.openPopup();
    const extensionSwitch = popup.getByTestId('toggle-extension-switch');

    const whileActive = await isolatedBackground.openTab(alias);
    await expect
      .poll(() => whileActive.url())
      .toContain(TEST_SITES.EXAMPLE_COM);

    await extensionSwitch.click();
    await expect
      .poll(async () =>
        isolatedBackground.readStorage(EExtStorageKey.EXT_STATE)
      )
      .toBe(EExtensionState.INACTIVE);
    await expect.poll(() => isolatedBackground.readDynamicRules()).toEqual([]);
    const whileInactive = await isolatedBackground.openTab(alias);
    // Settled before resuming, or a late redirect of this tab would read as ACTIVE
    await whileInactive.waitForLoadState('load').catch(() => undefined);
    expect(whileInactive.url()).not.toContain(TEST_SITES.EXAMPLE_COM);

    await extensionSwitch.click();
    await expect
      .poll(async () =>
        isolatedBackground.readStorage(EExtStorageKey.EXT_STATE)
      )
      .toBe(EExtensionState.ACTIVE);
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);
    const whileResumed = await isolatedBackground.openTab(alias);
    await expect
      .poll(() => whileResumed.url())
      .toContain(TEST_SITES.EXAMPLE_COM);

    expect(whileInactive.url()).not.toContain(TEST_SITES.EXAMPLE_COM);
    await Promise.all(
      [whileActive, whileInactive, whileResumed].map(async (page) =>
        page.close()
      )
    );
  });
});
