import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';

// The Safari redirect fix (same-origin authDomain + /__/auth proxy) is applied
// to prod only. Local dev keeps the cross-domain authDomain — replicating it
// needs https dev + a separate OAuth redirect URI, which isn't worth the setup.
const firebaseApp = initializeApp(
  getFirebasePublicConfig(process.env.NODE_ENV === 'production')
);

export default firebaseApp;
