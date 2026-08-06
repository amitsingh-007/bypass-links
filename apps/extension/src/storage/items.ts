import type {
  IBookmarksObj,
  IPersons,
  ILastVisited,
  PersonImageUrls,
  IRedirections,
  IWebsites,
} from '@bypass/shared';
import { STORAGE_KEYS } from '@bypass/shared';
import { storage } from 'wxt/utils/storage';

import { EExtensionState, EExtStorageKey } from '@/constants';
import type { IMappedRedirections } from '@/entrypoints/background/interfaces/redirections';

/** Every item lives in `local:` with a fallback; keeps the eleven call sites flat. */
const defineLocalItem = <T>(key: string, fallback: T) =>
  storage.defineItem<T>(`local:${key}`, { fallback });

export const bookmarksItem = defineLocalItem<IBookmarksObj>(
  STORAGE_KEYS.bookmarks,
  { folderList: {}, urlList: {}, folders: {} }
);

export const websitesItem = defineLocalItem<IWebsites>(
  STORAGE_KEYS.websites,
  {}
);

export const lastVisitedItem = defineLocalItem<ILastVisited>(
  STORAGE_KEYS.lastVisited,
  {}
);

export const personsItem = defineLocalItem<IPersons>(STORAGE_KEYS.persons, {});

export const redirectionsItem = defineLocalItem<IRedirections>(
  STORAGE_KEYS.redirections,
  []
);

export const mappedRedirectionsItem = defineLocalItem<IMappedRedirections>(
  STORAGE_KEYS.mappedRedirections,
  {}
);

export const personImageUrlsItem = defineLocalItem<PersonImageUrls>(
  STORAGE_KEYS.personImageUrls,
  {}
);

export const extStateItem = defineLocalItem<EExtensionState>(
  EExtStorageKey.EXT_STATE,
  EExtensionState.ACTIVE
);

export const hasPendingBookmarksItem = defineLocalItem<boolean>(
  EExtStorageKey.HAS_PENDING_BOOKMARKS,
  false
);

export const hasPendingPersonsItem = defineLocalItem<boolean>(
  EExtStorageKey.HAS_PENDING_PERSONS,
  false
);

// No fallback: absence is meaningful, so this one stays a direct call
export const historyStartTimeItem = storage.defineItem<number>(
  `local:${EExtStorageKey.HISTORY_START_TIME}`
);
