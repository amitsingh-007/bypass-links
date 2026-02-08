import { getFirebasePublicConfig } from '@bypass/configs/firebase.config';
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(
  getFirebasePublicConfig(process.env.NODE_ENV === 'production')
);

export default firebaseApp;
