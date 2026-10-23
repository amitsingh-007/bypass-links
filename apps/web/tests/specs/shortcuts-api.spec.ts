import { registerHooks } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  EStorageKey,
  encodeText,
  type IRedirections,
} from '@bypass/shared/server';
import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('stores Unicode shortcuts and serves plain and legacy values without changing IDs', async () => {
  const codecUrl = pathToFileURL(
    path.resolve('packages/shared/src/utils/codec.ts')
  ).href;
  const sharedUrl = `data:text/javascript,${encodeURIComponent(`
    export { encodeText, decodeText } from ${JSON.stringify(codecUrl)};
    export const EStorageKey = ${JSON.stringify(EStorageKey)};
  `)}`;
  const databaseUrl = `data:text/javascript,${encodeURIComponent(`
    export let stored = [];
    export let lastWrite;
    export const getFromFirebase = async () => stored;
    export const saveToFirebase = async input => {
      lastWrite = input;
      stored = Object.values(input.data);
    };
    export const upsertToFirebase = async () => { throw new Error('Unexpected database write'); };
  `)}`;
  const aliases = new Map([
    ['@bypass/shared/server', sharedUrl],
    ['../firebaseAdminService', databaseUrl],
  ]);
  const hooks = registerHooks({
    resolve(specifier, context, nextResolve) {
      return nextResolve(aliases.get(specifier) ?? specifier, context);
    },
  });
  try {
    const serviceUrl = pathToFileURL(
      path.resolve('packages/trpc/src/services/firebase/realtimeDBService.ts')
    );
    serviceUrl.search = 'shortcuts-api-test';
    const service: typeof import('../../../../packages/trpc/src/services/firebase/realtimeDBService') =
      await import(serviceUrl.href);
    const rules: IRedirections = [
      {
        id: crypto.randomUUID(),
        alias: 'http://legacy/',
        website: 'https://example.com/Café/%20/%41',
        isDefault: true,
      },
      {
        id: crypto.randomUUID(),
        alias: 'http://例子/😀',
        website: 'https://example.org/日本語/😀?q=%41',
        isDefault: false,
      },
      {
        id: crypto.randomUUID(),
        alias: 'invalid😀',
        website: 'invalid😀/%41',
        isDefault: false,
      },
    ];
    await service.saveRedirections(rules, 'test-user');
    const {
      stored,
      lastWrite,
    }: { stored: IRedirections; lastWrite: { ref: string; uid: string } } =
      await import(databaseUrl);
    expect(lastWrite).toMatchObject({
      ref: EStorageKey.redirections,
      uid: 'test-user',
    });
    expect(stored).toEqual(
      rules.map((rule) => ({
        ...rule,
        alias: encodeText(rule.alias),
        website: encodeText(rule.website),
      }))
    );
    expect(await service.listRedirections('test-user')).toEqual(rules);
    const legacy = await service.getRedirections('test-user');
    expect(legacy[0]).toEqual({
      ...rules[0],
      alias: btoa(rules[0].alias),
      website: btoa(rules[0].website),
    });
    expect(atob(legacy[1].alias)).toBe(new URL(rules[1].alias).href);
    expect(atob(legacy[1].website)).toBe(new URL(rules[1].website).href);
    expect(atob(legacy[2].website)).toBe('invalid%F0%9F%98%80/%41');
    expect(legacy.map(({ id, isDefault }) => ({ id, isDefault }))).toEqual(
      rules.map(({ id, isDefault }) => ({ id, isDefault }))
    );
  } finally {
    hooks.deregister();
  }
});
