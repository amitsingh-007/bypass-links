import { EStorageKey } from '@bypass/shared';
import { type BrowserContext } from '@playwright/test';

import { EExtensionState, EExtStorageKey } from '@/constants';

import {
  test,
  expect,
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
  getRedirectionStorage([
    { id: crypto.randomUUID(), alias: ALIAS, website, isDefault: false },
  ]);

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

  test('the native redirect permission adds no permission warnings', async ({
    isolatedBackground,
  }) => {
    const worker = await createSharedBackgroundSW(isolatedBackground.context);
    const warnings = await worker.evaluate(async () => {
      const manifest = chrome.runtime.getManifest();
      const previous = {
        ...manifest,
        permissions: manifest.permissions?.filter(
          (permission) => permission !== 'declarativeNetRequestWithHostAccess'
        ),
      };
      return Promise.all([
        chrome.management.getPermissionWarningsByManifest(
          JSON.stringify(previous)
        ),
        chrome.management.getPermissionWarningsByManifest(
          JSON.stringify(manifest)
        ),
      ]);
    });
    expect(warnings[1].toSorted()).toEqual(warnings[0].toSorted());
  });

  test('rapid shortcut edits settle on the last rule without duplicate IDs', async ({
    isolatedBackground,
  }) => {
    for (let revision = 0; revision < 8; revision++) {
      await isolatedBackground.writeStorage(
        rulesFor(`${FIRST_TARGET}?revision=${revision}`)
      );
    }
    await isolatedBackground.writeStorage(rulesFor(SECOND_TARGET));
    await expect
      .poll(async () =>
        (await isolatedBackground.readDynamicRules()).map(
          (rule) => rule.action.redirect?.url
        )
      )
      .toEqual([SECOND_TARGET]);
    const first = await isolatedBackground.readDynamicRules();
    await isolatedBackground.ensureInactiveState();
    await expect.poll(() => isolatedBackground.readDynamicRules()).toEqual([]);
    await isolatedBackground.ensureActiveState();
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toEqual(first);
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
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);
    const page = await isolatedBackground.openTab(ALIAS);
    try {
      await expect.poll(() => page.url()).toBe(FIRST_TARGET);

      const backgroundSW = await createSharedBackgroundSW(
        isolatedBackground.context
      );
      await isolatedBackground.writeStorage(rulesFor(SECOND_TARGET));
      await expect
        .poll(
          async () =>
            (await isolatedBackground.readDynamicRules())[0]?.action.redirect
              ?.url
        )
        .toBe(SECOND_TARGET);
      await page.goto(ALIAS, { waitUntil: 'commit' }).catch(() => undefined);
      await expect.poll(() => page.url()).toBe(SECOND_TARGET);

      await removeStorageFromWorker(
        backgroundSW,
        EStorageKey.mappedRedirections
      );
      await expect
        .poll(() => isolatedBackground.readDynamicRules())
        .toEqual([]);
      await page.goto(ALIAS, { waitUntil: 'load' }).catch(() => undefined);
      expect(page.url()).toBe(ALIAS);
      expect(await createSharedBackgroundSW(isolatedBackground.context)).toBe(
        backgroundSW
      );
    } finally {
      await page.close();
    }
  });

  test('worker restart keeps native redirect rules and restores history matching', async ({
    isolatedBackground,
  }) => {
    await routePages(isolatedBackground.context);
    await isolatedBackground.writeStorage(rulesFor(FIRST_TARGET));
    await expect
      .poll(() => isolatedBackground.readDynamicRules())
      .toHaveLength(1);
    const page = await isolatedBackground.openTab(ALIAS);
    try {
      await expect.poll(() => page.url()).toBe(FIRST_TARGET);
      const before = await isolatedBackground.readDynamicRules();
      await restartBackgroundWorker(isolatedBackground.context);
      expect(await isolatedBackground.readDynamicRules()).toEqual(before);
      await isolatedBackground.clearHistoryStartTime();
      await page.goto(ALIAS, { waitUntil: 'commit' }).catch(() => undefined);
      await expect.poll(() => page.url()).toBe(FIRST_TARGET);

      await expect
        .poll(() =>
          isolatedBackground.readStorage(EExtStorageKey.HISTORY_START_TIME)
        )
        .toBeDefined();
      await isolatedBackground.ensureInactiveState();
      await expect
        .poll(() => isolatedBackground.readDynamicRules())
        .toEqual([]);
      await page.goto(ALIAS, { waitUntil: 'load' }).catch(() => undefined);
      expect(page.url()).toBe(ALIAS);
    } finally {
      await page.close();
    }
  });
});
