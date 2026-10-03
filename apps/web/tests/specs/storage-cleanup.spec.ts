import { createRequire, registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { test, expect } from '@playwright/test';
import { NextRequest } from 'next/server.js';

test.use({ storageState: { cookies: [], origins: [] } });

test('authenticates storage cleanup requests before calling cleanup', async () => {
  const secret = 'storage-cleanup-test-key';
  const userId = 'disposable-cleanup-test-user';
  const authorizationUrl = `${
    pathToFileURL(path.resolve('packages/trpc/src/utils/authorization.ts')).href
  }?storage-cleanup-test`;
  const trpcUrl = `data:text/javascript,${encodeURIComponent(`
    export { getAuthBearer } from ${JSON.stringify(authorizationUrl)};
    export const cleanupCalls = [];
    export const cleanupStorage = async uid => { cleanupCalls.push(uid); };
  `)}`;
  const require = createRequire(path.resolve('apps/web/package.json'));
  const aliases = new Map([
    ['@bypass/trpc', trpcUrl],
    [
      '../services/firebaseAdminService',
      `data:text/javascript,${encodeURIComponent(`
        export const verifyAuthToken = () => { throw new Error('Firebase is unavailable in this test'); };
      `)}`,
    ],
    [
      '@app/constants/env/server',
      `data:text/javascript,export const serverEnv = ${encodeURIComponent(
        JSON.stringify({
          FIREBASE_CRON_JOB_API_KEY: secret,
          FIREBASE_TEST_USER_ID: userId,
        })
      )};`,
    ],
    ['next/server', require.resolve('next/server')],
  ]);
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      return nextResolve(aliases.get(specifier) ?? specifier, context);
    },
  });

  try {
    const { cleanupCalls }: { cleanupCalls: string[] } = await import(trpcUrl);
    const routeUrl = pathToFileURL(
      path.resolve('apps/web/src/app/api/storage-cleanup/route.ts')
    );
    routeUrl.search = 'storage-cleanup-test';
    const { POST }: typeof import('../../src/app/api/storage-cleanup/route') =
      await import(routeUrl.href);
    const invoke = (authorization?: string) =>
      POST(
        new NextRequest('http://localhost/api/storage-cleanup', {
          method: 'POST',
          headers: authorization ? { authorization } : {},
        })
      );
    for (const authorization of [
      undefined,
      'Bearer ',
      'Basic credentials',
      'Bearer wrong',
      `Bearer ${'x'.repeat(secret.length)}`,
      `Bearer ${secret}extra`,
      `Bearer é${'x'.repeat(secret.length - 1)}`,
      `Bearer é${'x'.repeat(secret.length - 2)}`,
    ]) {
      const response = await invoke(authorization);
      expect(response.status).toBe(403);
      expect(await response.text()).toBe('Forbidden invocation');
      expect(cleanupCalls).toEqual([]);
    }

    const response = await invoke(`Bearer ${secret}`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'Cleanup successful' });
    expect(cleanupCalls).toEqual([userId]);
  } finally {
    hooks.deregister();
  }
});
