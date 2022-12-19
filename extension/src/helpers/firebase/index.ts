import { getFirebasePublicConfig } from '@bypass/common/constants/firebase';
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(getFirebasePublicConfig());

export default firebaseApp;
