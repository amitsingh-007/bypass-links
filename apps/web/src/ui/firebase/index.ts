import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(getFirebasePublicConfig(PROD_ENV));

export default firebaseApp;
