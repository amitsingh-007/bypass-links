import { getFullDbPath } from "@common/utils/firebase";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  signInWithCredential,
  signOut,
} from "firebase/auth";
import { get, getDatabase, ref, set } from "firebase/database";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref as ref1,
  uploadBytes,
} from "firebase/storage";
import { getUserProfile } from "GlobalHelpers/fetchFromStorage";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyDiMRlBhW36sLjEADoQj9T5L1H-hIDUAso",
  authDomain: "bypass-links.firebaseapp.com",
  databaseURL: "https://bypass-links.firebaseio.com/",
  projectId: "bypass-links",
  storageBucket: "bypass-links.appspot.com",
  messagingSenderId: "603462573180",
  appId: "1:603462573180:web:317c7f02f1f66b836f3df9",
  measurementId: "G-ZGKPZFJ01Z",
});

/**
 * AUTHORIZATION
 */
export const googleSignIn = async (token: string) => {
  const auth = initializeAuth(firebaseApp, {
    persistence: indexedDBLocalPersistence,
  });
  const response = await signInWithCredential(
    auth,
    GoogleAuthProvider.credential(null, token)
  );
  return response;
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

export const uploadImageToFirebase = async (blob: Blob, ref: string) => {
  const storage = getStorage(firebaseApp);
  const path = ref1(storage, await getStoragePath(ref));
  await uploadBytes(path, blob, { contentType: blob.type });
};

export const getImageFromFirebase = async (ref: string) => {
  const storage = getStorage(firebaseApp);
  const path = ref1(storage, await getStoragePath(ref));
  return getDownloadURL(path);
};

export const removeImageFromFirebase = async (ref: string) => {
  const storage = getStorage(firebaseApp);
  const path = ref1(storage, await getStoragePath(ref));
  await deleteObject(path);
};
