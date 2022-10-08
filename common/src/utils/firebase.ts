import { getEnv } from './env';

export const getFullDbPath = (
  ref: string,
  uid?: string,
  isAbsolute = false
) => {
  if (isAbsolute) {
    return ref;
  }
  const env = getEnv();
  return `${env}/${uid}/${ref}`;
};

export const getPublicConfig = () => ({
  apiKey: 'AIzaSyDiMRlBhW36sLjEADoQj9T5L1H-hIDUAso',
  authDomain: 'bypass-links.firebaseapp.com',
  databaseURL: 'https://bypass-links.firebaseio.com/',
  projectId: 'bypass-links',
  storageBucket: 'bypass-links.appspot.com',
  messagingSenderId: '603462573180',
  appId: '1:603462573180:web:317c7f02f1f66b836f3df9',
  measurementId: 'G-ZGKPZFJ01Z',
});
