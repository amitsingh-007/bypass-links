import { EStorageKey, encodeLegacyNames } from '@bypass/shared';
import { BookmarksObjSchema, PersonsSchema } from '@bypass/shared/schema';
import { type z } from 'zod/mini';

const codecVersionKey = (key: string) => `${key}:codecVersion`;

const nameKeys = new Set<string>([EStorageKey.bookmarks, EStorageKey.persons]);
const hasEncodedNames = (
  key: string
): key is EStorageKey.bookmarks | EStorageKey.persons => nameKeys.has(key);

export const getFromLocalStorage = <T>(
  key: string,
  schema: z.ZodMiniType<T>
): T | null => {
  const data = localStorage.getItem(key);
  if (!data) {
    return null;
  }
  let value = JSON.parse(data);
  if (
    hasEncodedNames(key) &&
    localStorage.getItem(codecVersionKey(key)) !== '2'
  ) {
    if (key === EStorageKey.persons) {
      PersonsSchema.parse(value);
      value = encodeLegacyNames(value);
    } else {
      BookmarksObjSchema.parse(value);
      value = { ...value, folderList: encodeLegacyNames(value.folderList) };
    }
    setToLocalStorage(key, value);
  }
  return schema.parse(value);
};

export const setToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
  if (hasEncodedNames(key)) {
    localStorage.setItem(codecVersionKey(key), '2');
  }
};
