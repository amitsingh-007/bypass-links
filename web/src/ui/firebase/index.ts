import { getFirebasePublicConfig } from '@bypass/shared/constants/firebase';
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(getFirebasePublicConfig());

export default firebaseApp;
