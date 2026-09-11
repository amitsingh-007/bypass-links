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

interface ProfileOptions {
  /** Kept when true, so pre-logout attempts the save the test controls itself. */
  keepPendingFlags?: boolean;
}

/** Every remote write a signed-in profile can make. */
const ACCOUNT_WRITES = [
  'bookmarkAndPersonSave',
  'redirectionsPost',
  'upsertLastVisited',
];

/** Disposable copy of the authenticated profile, so destructive flows cannot touch the shared account. */
export const withSignedInProfile = async (
  run: (profile: SignedInProfile) => Promise<void>,
  { keepPendingFlags = false }: ProfileOptions = {}
) =>
  withTempProfileContext({ seedFromCachedProfile: true }, async (context) => {
    const sawAccountWrite = await abortAccountWrites(context, ACCOUNT_WRITES);
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
      // Soft: throwing from a finally would mask the body's own failure
      expect
        .soft(sawAccountWrite(), 'a write reached the shared test account')
        .toBe(false);
    }
  });
