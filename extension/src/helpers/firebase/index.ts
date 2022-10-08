import { initializeApp } from 'firebase/app';
import { getPublicConfig } from '@common/utils/firebase';

const firebaseApp = initializeApp(getPublicConfig());

export default firebaseApp;
