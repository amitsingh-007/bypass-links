export enum FIREBASE_DB_REF {
  bookmarks = 'bookmarks',
  bypass = 'bypass',
  lastVisited = 'lastVisited',
  persons = 'persons',
  redirections = 'redirections',
  settings = 'userInfo/settings',
  user2FAInfo = 'userInfo/twoFactorAuth',
}

export const FIREBASE_PUBLIC_CONFIG = {
  apiKey: 'AIzaSyDiMRlBhW36sLjEADoQj9T5L1H-hIDUAso',
  authDomain: 'bypass-links.firebaseapp.com',
  databaseURL: 'https://bypass-links.firebaseio.com/',
  projectId: 'bypass-links',
  storageBucket: 'bypass-links.appspot.com',
  messagingSenderId: '603462573180',
  appId: '1:603462573180:web:317c7f02f1f66b836f3df9',
  measurementId: 'G-ZGKPZFJ01Z',
};
