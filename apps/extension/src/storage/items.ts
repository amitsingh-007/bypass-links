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

import { EExtensionState, EXT_STORAGE_KEYS } from '@/constants';
import type { IMappedRedirections } from '@/entrypoints/background/interfaces/redirections';

export const bookmarksItem = storage.defineItem<IBookmarksObj>(
  `local:${STORAGE_KEYS.bookmarks}`,
  { fallback: { folderList: {}, urlList: {}, folders: {} } }
);

export const websitesItem = storage.defineItem<IWebsites>(
  `local:${STORAGE_KEYS.websites}`,
  { fallback: {} }
);

export const lastVisitedItem = storage.defineItem<ILastVisited>(
  `local:${STORAGE_KEYS.lastVisited}`,
  { fallback: {} }
);

export const personsItem = storage.defineItem<IPersons>(
  `local:${STORAGE_KEYS.persons}`,
  { fallback: {} }
);

export const redirectionsItem = storage.defineItem<IRedirections>(
  `local:${STORAGE_KEYS.redirections}`,
  { fallback: [] }
);

export const mappedRedirectionsItem = storage.defineItem<IMappedRedirections>(
  `local:${STORAGE_KEYS.mappedRedirections}`,
  { fallback: {} }
);

export const personImageUrlsItem = storage.defineItem<PersonImageUrls>(
  `local:${STORAGE_KEYS.personImageUrls}`,
  { fallback: {} }
);

export const extStateItem = storage.defineItem<EExtensionState>(
  `local:${EXT_STORAGE_KEYS.extState}`,
  { fallback: EExtensionState.ACTIVE }
);

export const hasPendingBookmarksItem = storage.defineItem<boolean>(
  `local:${EXT_STORAGE_KEYS.hasPendingBookmarks}`,
  { fallback: false }
);

export const hasPendingPersonsItem = storage.defineItem<boolean>(
  `local:${EXT_STORAGE_KEYS.hasPendingPersons}`,
  { fallback: false }
);

export const historyStartTimeItem = storage.defineItem<number>(
  `local:${EXT_STORAGE_KEYS.historyStartTime}`
);
