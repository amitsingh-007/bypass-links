import { expect, type BrowserContext, type Worker } from '@playwright/test';

import { EExtStorageKey } from '@/constants';

import { removeStorageFromWorker } from '../fixtures/background-fixture';
import {
  abortAccountWrites,
  createSharedBackgroundSW,
  getExtensionId,
  withTempProfileContext,
} from '../fixtures/base-fixture';

/** Tabs `processPostLogout` opens; fulfilled empty so no real page is fetched. */
export const GOOGLE_LOGOUT_TABS = [
  'https://www.google.com/',
  'https://www.google.com/imghp',
  'https://myactivity.google.com/activitycontrols/webandapp',
];

interface SignedInProfile {
  context: BrowserContext;
  extensionId: string;
  backgroundSW: Worker;
}

interface Options {
  /** Kept when true, so pre-logout attempts the save the test controls itself. */
  keepPendingFlags?: boolean;
  /** Off only for tests that route the account write themselves. */
  guardAccountWrites?: boolean;
}

/**
 * Runs `run` against a disposable copy of the authenticated profile, so
 * destructive flows cannot overwrite the shared account or the cached profile
 * every other spec reads.
 */
export const withSignedInProfile = async (
  { keepPendingFlags = false, guardAccountWrites = true }: Options,
  run: (profile: SignedInProfile) => Promise<void>
) =>
  withTempProfileContext({ seedFromCachedProfile: true }, async (context) => {
    const sawAccountWrite = guardAccountWrites
      ? await abortAccountWrites(context)
      : undefined;
    for (const url of GOOGLE_LOGOUT_TABS) {
      await context.route(`${url}**`, async (route) => {
        await route.fulfill({ contentType: 'text/html', body: '' });
      });
    }

    const backgroundSW = await createSharedBackgroundSW(context);
    const extensionId = await getExtensionId(backgroundSW);
    if (!keepPendingFlags) {
      // Nothing pending means pre-logout skips the shared account write entirely
      await removeStorageFromWorker(backgroundSW, [
        EExtStorageKey.HAS_PENDING_BOOKMARKS,
        EExtStorageKey.HAS_PENDING_PERSONS,
      ]);
    }

    try {
      await run({ context, extensionId, backgroundSW });
    } finally {
      // Soft, because throwing from a finally replaces whatever failure the
      // body was already reporting
      expect
        .soft(
          sawAccountWrite?.() ?? false,
          'logout tried to write the shared test account'
        )
        .toBe(false);
    }
  });
