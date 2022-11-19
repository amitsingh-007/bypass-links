import { FIREBASE_PUBLIC_CONFIG } from '@common/constants/firebase';
import { initializeApp } from 'firebase/app';

const firebaseApp = initializeApp(FIREBASE_PUBLIC_CONFIG);

export default firebaseApp;
