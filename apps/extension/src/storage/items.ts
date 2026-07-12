import type {
  IBookmarksObj,
  IPersons,
  ILastVisited,
  PersonImageUrls,
  IRedirections,
  IWebsites,
} from '@bypass/shared';
import { storage } from 'wxt/utils/storage';

import { EExtensionState } from '@/constants';
import type { IMappedRedirections } from '@/entrypoints/background/interfaces/redirections';

export const bookmarksItem = storage.defineItem<IBookmarksObj>(
  'local:bookmarks',
  { fallback: { folderList: {}, urlList: {}, folders: {} } }
);

export const websitesItem = storage.defineItem<IWebsites>('local:websites', {
  fallback: {} as unknown as IWebsites,
});

export const lastVisitedItem = storage.defineItem<ILastVisited>(
  'local:lastVisited',
  { fallback: {} }
);

export const personsItem = storage.defineItem<IPersons>('local:persons', {
  fallback: {},
});

export const redirectionsItem = storage.defineItem<IRedirections>(
  'local:redirections',
  { fallback: [] }
);

export const mappedRedirectionsItem = storage.defineItem<IMappedRedirections>(
  'local:mappedRedirections',
  { fallback: {} }
);

export const personImageUrlsItem = storage.defineItem<PersonImageUrls>(
  'local:personImageUrls',
  { fallback: {} }
);

export const extStateItem = storage.defineItem<EExtensionState>(
  'local:extState',
  { fallback: EExtensionState.ACTIVE }
);

export const hasPendingBookmarksItem = storage.defineItem<boolean>(
  'local:hasPendingBookmarks',
  { fallback: false }
);

export const hasPendingPersonsItem = storage.defineItem<boolean>(
  'local:hasPendingPersons',
  { fallback: false }
);

export const historyStartTimeItem = storage.defineItem<number>(
  'local:historyStartTime'
);
