import { getFullDbPath } from "@common/utils/firebase";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { get, getDatabase, ref, set } from "firebase/database";
import { getUserProfile } from "GlobalHelpers/fetchFromStorage";

const firebaseConfig = {
  apiKey: "AIzaSyDiMRlBhW36sLjEADoQj9T5L1H-hIDUAso",
  authDomain: "bypass-links.firebaseapp.com",
  databaseURL: "https://bypass-links.firebaseio.com/",
  projectId: "bypass-links",
  storageBucket: "bypass-links.appspot.com",
  messagingSenderId: "603462573180",
  appId: "1:603462573180:web:317c7f02f1f66b836f3df9",
  measurementId: "G-ZGKPZFJ01Z",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

/**
 * AUTHORIZATION
 */
export const googleSignIn = (token: string) => {
  const auth = getAuth(firebaseApp);
  return signInWithCredential(auth, GoogleAuthProvider.credential(null, token));
};

export const googleSignOut = () => {
  const auth = getAuth(firebaseApp);
  return signOut(auth);
};

/**
 * REALTIME DATABASE
 */
const getDbRef = async (ref: string) => {
  const userProfile = await getUserProfile();
  return getFullDbPath(ref, userProfile.uid);
};

export const getFromFirebase = async <T>(path: string) => {
  const db = getDatabase(firebaseApp);
  const dbRef = ref(db, await getDbRef(path));
  const snapshot = await get(dbRef);
  return (snapshot.val() || {}) as T;
};

export const saveToFirebase = async (path: string, data: any) => {
  try {
    const db = getDatabase(firebaseApp);
    const dbRef = ref(db, await getDbRef(path));
    await set(dbRef, data);
    return true;
  } catch (err) {
    console.log(`Error while saving data to Firebase db: ${ref}`, err);
    return false;
  }
};

/**
 * STORAGE
 */

const getStoragePath = async (ref: string) => {
  const env = __PROD__ ? "prod" : "dev";
  const userProfile = await getUserProfile();
  return `${userProfile.uid}/${env}/${ref}`;
};

export const uploadImageToFirebase = async (blob: Blob, ref: string) =>
  firebase
    .storage()
    .ref()
    .child(await getStoragePath(ref))
    .put(blob, { contentType: blob.type });

export const getImageFromFirebase = async (ref: string): Promise<string> =>
  firebase
    .storage()
    .ref()
    .child(await getStoragePath(ref))
    .getDownloadURL();

export const removeImageFromFirebase = async (ref: string) =>
  firebase
    .storage()
    .ref()
    .child(await getStoragePath(ref))
    .delete();
