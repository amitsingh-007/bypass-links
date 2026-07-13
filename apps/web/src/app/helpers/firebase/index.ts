import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';

const isProd = process.env.NODE_ENV === 'production';
const config = getFirebasePublicConfig(isProd);

// HTTPS local dev (`pnpm dev:https`): use our own origin as authDomain to keep
// signInWithRedirect same-origin. Firebase forces https on the handler URL, so
// this can't work over the default http `pnpm dev`.
if (
  !isProd &&
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:'
) {
  config.authDomain = window.location.host;
}

const firebaseApp = initializeApp(config);

export default firebaseApp;
