import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { GLOBALS } from '@bypass/shared';
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(getFirebasePublicConfig(GLOBALS.PROD_ENV));

export default firebaseApp;
