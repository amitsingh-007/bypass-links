import { FIREBASE_DB_REF } from './firebase';

export const STORAGE_KEYS = {
  bookmarks: FIREBASE_DB_REF.bookmarks,
  bypass: FIREBASE_DB_REF.bypass,
  redirections: FIREBASE_DB_REF.redirections,
  lastVisited: FIREBASE_DB_REF.lastVisited,
  persons: FIREBASE_DB_REF.persons,
  mappedRedirections: 'mappedRedirections',
  personImageUrls: 'personImageUrls',
  userProfile: 'userProfile',
  settings: 'settings',
};
