import type {
  IBookmarksObj,
  IPersons,
  ILastVisited,
  PersonImageUrls,
  IRedirections,
  IWebsites,
} from '@bypass/shared';
import { EStorageKey } from '@bypass/shared';
import { storage } from 'wxt/utils/storage';

import { EExtensionState, EExtStorageKey } from '@/constants';
import type { IMappedRedirections } from '@/entrypoints/background/interfaces/redirections';

/** Constrained to the known key sets so a typo cannot open a new namespace. */
type LocalStorageKey = EStorageKey | EExtStorageKey;

const defineLocalItem = <T>(key: LocalStorageKey, fallback: T) =>
  storage.defineItem<T>(`local:${key}`, { fallback });

export const bookmarksItem = defineLocalItem<IBookmarksObj>(
  EStorageKey.bookmarks,
  { folderList: {}, urlList: {}, folders: {} }
);

export const websitesItem = defineLocalItem<IWebsites>(
  EStorageKey.websites,
  {}
);

export const lastVisitedItem = defineLocalItem<ILastVisited>(
  EStorageKey.lastVisited,
  {}
);

export const personsItem = defineLocalItem<IPersons>(EStorageKey.persons, {});

export const redirectionsItem = defineLocalItem<IRedirections>(
  EStorageKey.redirections,
  []
);

export const mappedRedirectionsItem = defineLocalItem<IMappedRedirections>(
  EStorageKey.mappedRedirections,
  {}
);

export const personImageUrlsItem = defineLocalItem<PersonImageUrls>(
  EStorageKey.personImageUrls,
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
