import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';

const isProd = process.env.NODE_ENV === 'production';
const config = getFirebasePublicConfig(isProd);

// In HTTPS local dev (`pnpm dev:https`), point authDomain at our own origin so
// signInWithRedirect stays same-origin via the /__/auth proxy in next.config —
// Firebase always builds the handler URL as `https://<authDomain>/__/auth/...`,
// so this only works over https, not the default http `pnpm dev`.
if (
  !isProd &&
  typeof window !== 'undefined' &&
  window.location.protocol === 'https:'
) {
  config.authDomain = window.location.host;
}

const firebaseApp = initializeApp(config);

export default firebaseApp;
