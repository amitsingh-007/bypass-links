import storage from "ChromeApi/storage";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";

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

firebase.initializeApp(firebaseConfig);

/**
 * AUTHORIZATION
 */
export const googleSignIn = (token) =>
  firebase
    .auth()
    .signInWithCredential(
      firebase.auth.GoogleAuthProvider.credential(null, token)
    );

export const googleSignOut = () => firebase.auth().signOut();

/**
 * REALTIME DATABASE
 */

const getDbRef = async (ref, isFallback = false) => {
  const env = __PROD__ ? "prod" : "dev";
  const dbPrefix = isFallback ? "fallback" : "live";
  const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
    STORAGE_KEYS.userProfile
  );
  return `${env}/${userProfile.uid}/${dbPrefix}/${ref}`;
};

const copyToFallbackDB = async (dbRef) => {
  const snapshot = await getFromFirebase(dbRef);
  await saveToFirebase(dbRef, snapshot.val(), true);
  console.log(`Updated fallback ${dbRef}`);
};

export const getFromFirebase = async (ref) =>
  firebase
    .database()
    .ref(await getDbRef(ref))
    .once("value");

export const saveToFirebase = async (ref, data, isFallback = false) =>
  firebase
    .database()
    .ref(await getDbRef(ref, isFallback))
    .set(data);

export const saveDataToFirebase = async (data, ref, successCallback) => {
  await copyToFallbackDB(ref);
  return new Promise((resolve, _reject) => {
    saveToFirebase(ref, data)
      .then(async () => {
        if (successCallback) {
          await successCallback();
        }
        resolve(true);
      })
      .catch((err) => {
        console.log(`Error while saving data to Firebase db: ${ref}`, err);
        resolve(false);
      });
  });
};

/**
 * STORAGE
 */

const getStoragePath = async (ref) => {
  const env = __PROD__ ? "prod" : "dev";
  const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
    STORAGE_KEYS.userProfile
  );
  return `${userProfile.uid}/${env}/${ref}`;
};

export const uploadImageToFirebase = async (blob, ref) =>
  firebase
    .storage()
    .ref()
    .child(await getStoragePath(ref))
    .put(blob, { contentType: blob.type });

export const getImageFromFirebase = async (ref) =>
  firebase
    .storage()
    .ref()
    .child(await getStoragePath(ref))
    .getDownloadURL();

export const removeImageFromFirebase = async (ref) =>
  firebase
    .storage()
    .ref()
    .child(await getStoragePath(ref))
    .delete();
