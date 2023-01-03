import { getFirebasePublicConfig } from '@bypass/shared';
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(getFirebasePublicConfig());

export default firebaseApp;
