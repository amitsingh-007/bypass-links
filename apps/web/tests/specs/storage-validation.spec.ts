import { BookmarksObjSchema } from '@bypass/shared/schema';
import { test as base, expect } from '@playwright/test';
import { z } from 'zod/mini';

import {
  getFromLocalStorage,
  setToLocalStorage,
} from '../../src/app/utils/storage';

const test = base.extend<{ storedValues: Map<string, string> }>({
  async storedValues({}, use) {
    const descriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'localStorage'
    );
    const values = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    try {
      await use(values);
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, 'localStorage', descriptor);
      } else {
        Reflect.deleteProperty(globalThis, 'localStorage');
      }
    }
  },
});

test.describe('Validated storage reads', () => {
  test('preserves valid values and returns null for missing keys', ({
    storedValues,
  }) => {
    expect(getFromLocalStorage('missing', z.string())).toBeNull();
    setToLocalStorage('value', { name: 'saved' });
    expect(
      getFromLocalStorage('value', z.object({ name: z.string() }))
    ).toEqual({ name: 'saved' });
    expect(storedValues.get('value')).toBe('{"name":"saved"}');
  });

  test('rejects malformed values without changing them', ({ storedValues }) => {
    for (const raw of ['{', '42', '{"name":false}']) {
      storedValues.set('value', raw);
      expect(() =>
        getFromLocalStorage('value', z.object({ name: z.string() }))
      ).toThrow();
      expect(storedValues.get('value')).toBe(raw);
    }
  });

  test('defaults missing bookmark tags without rewriting saved data', ({
    storedValues,
  }) => {
    const bookmark = {
      id: 'bookmark',
      url: 'url',
      title: 'title',
      parentHash: 'root',
    };
    const raw = JSON.stringify({
      folderList: {},
      urlList: { bookmark },
      folders: {},
    });
    storedValues.set('bookmarks', raw);
    expect(
      getFromLocalStorage('bookmarks', BookmarksObjSchema)?.urlList.bookmark
        .taggedPersons
    ).toEqual([]);
    expect(storedValues.get('bookmarks')).toBe(raw);
  });
});
