import { EStorageKey } from '@bypass/shared';
import { type BrowserContext } from '@playwright/test';

import { EExtensionState, EExtStorageKey } from '@/constants';

import {
  test,
  expect,
  observeBackgroundNavigation,
  recordIconUpdates,
  removeStorageFromWorker,
  restartBackgroundWorker,
} from '../fixtures/background-fixture';
import { createSharedBackgroundSW } from '../fixtures/base-fixture';
import { getRedirectionStorage } from '../utils/test-utils';

const ALIAS = 'http://e2e-storage/';
const FIRST_TARGET = 'https://background.test/first';
const SECOND_TARGET = 'https://background.test/second';

const rulesFor = (website: string) =>
  getRedirectionStorage([{ alias: ALIAS, website, isDefault: false }]);

const routePages = async (context: BrowserContext) => {
  await context.route('https://background.test/**', async (route) => {
    await route.fulfill({ contentType: 'text/html', body: '' });
  });
  await context.route(`${ALIAS}**`, async (route) => {
    await route.fulfill({ contentType: 'text/html', body: '' });
  });
};

test.describe('Background Service Worker Lifecycle', () => {
  test('onInstalled writes extState=active on first install', async ({
    isolatedBackground,
  }) => {
    await expect
      .poll(async () =>
        isolatedBackground.readStorage(EExtStorageKey.EXT_STATE)
      )
      .toBe(EExtensionState.ACTIVE);
  });

  /** The host never resolves, so an unintercepted fetch rejects instead of passing. */
  test('context routing reaches requests made by the worker itself', async ({
    isolatedBackground,
  }) => {
    const probeUrl = 'https://worker-route-probe.test/';
    await isolatedBackground.context.route(probeUrl, async (route) => {
      await route.fulfill({ contentType: 'text/plain', body: 'intercepted' });
    });
    const backgroundSW = await createSharedBackgroundSW(
      isolatedBackground.context
    );

    const body = await backgroundSW.evaluate(async (url) => {
      const response = await fetch(url);
      return response.text();
    }, probeUrl);

    expect(body).toBe('intercepted');
  });

  test('state and either pending flag update the icon, including removal fallbacks', async ({
    isolatedBackground,
  }) => {
    const backgroundSW = await createSharedBackgroundSW(
      isolatedBackground.context
    );
    const lastIcon = await recordIconUpdates(backgroundSW);
    const expectIcon = async (state: 'on' | 'off' | 'pending') => {
      await expect.poll(lastIcon).toBe(`assets/bypass_link_${state}_32.png`);
    };

    await isolatedBackground.ensureInactiveState();
    await expectIcon('off');
    for (const key of [
      EExtStorageKey.HAS_PENDING_BOOKMARKS,
      EExtStorageKey.HAS_PENDING_PERSONS,
    ]) {
      await isolatedBackground.writeStorage({ [key]: true });
      await expectIcon('pending');
      await removeStorageFromWorker(backgroundSW, key);
      await expectIcon('off');
    }
    await removeStorageFromWorker(backgroundSW, EExtStorageKey.EXT_STATE);
    await expectIcon('on');
    await isolatedBackground.ensureInactiveState();
    await expectIcon('off');
    await isolatedBackground.ensureActiveState();
    await expectIcon('on');
  });

  test('redirection edits and removal take effect without restarting the worker', async ({
    isolatedBackground,
  }) => {
    await routePages(isolatedBackground.context);
    await isolatedBackground.writeStorage(rulesFor(FIRST_TARGET));
    const page = await isolatedBackground.openTab(ALIAS);
    try {
      await expect.poll(() => page.url()).toBe(FIRST_TARGET);

      const backgroundSW = await createSharedBackgroundSW(
        isolatedBackground.context
      );
      const navigation = await observeBackgroundNavigation(backgroundSW);
      await isolatedBackground.writeStorage(rulesFor(SECOND_TARGET));
      await page.goto(ALIAS, { waitUntil: 'commit' }).catch(() => undefined);
      await expect.poll(() => page.url()).toBe(SECOND_TARGET);

      await removeStorageFromWorker(
        backgroundSW,
        EStorageKey.mappedRedirections
      );
      await navigation.reset();
      await page.goto(ALIAS, { waitUntil: 'load' }).catch(() => undefined);
      expect(await navigation.url()).toBe(ALIAS);
      expect(page.url()).toBe(ALIAS);
      expect(await createSharedBackgroundSW(isolatedBackground.context)).toBe(
        backgroundSW
      );
    } finally {
      await page.close();
    }
  });

  test('worker restart refills navigation caches from persisted storage', async ({
    isolatedBackground,
  }) => {
    await routePages(isolatedBackground.context);
    await isolatedBackground.writeStorage(rulesFor(FIRST_TARGET));
    const page = await isolatedBackground.openTab(ALIAS);
    try {
      await expect.poll(() => page.url()).toBe(FIRST_TARGET);
      const backgroundSW = await restartBackgroundWorker(
        isolatedBackground.context
      );
      const navigation = await observeBackgroundNavigation(backgroundSW);
      await page.goto(ALIAS, { waitUntil: 'commit' }).catch(() => undefined);
      await expect.poll(() => page.url()).toBe(FIRST_TARGET);

      await isolatedBackground.ensureInactiveState();
      await navigation.reset();
      await page.goto(ALIAS, { waitUntil: 'load' }).catch(() => undefined);
      expect(await navigation.url()).toBe(ALIAS);
      expect(page.url()).toBe(ALIAS);
    } finally {
      await page.close();
    }
  });
});
