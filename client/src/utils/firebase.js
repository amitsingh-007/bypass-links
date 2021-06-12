import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";
import { getUserProfile } from "SrcPath/SettingsPanel/utils";
const { getFullDbPath } = require("../../../common/src/utils/firebase");

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
const getDbRef = async (ref) => {
  const userProfile = await getUserProfile();
  return getFullDbPath(ref, userProfile.uid);
};

export const getFromFirebase = async (ref) =>
  firebase
    .database()
    .ref(await getDbRef(ref))
    .once("value");

export const saveToFirebase = async (ref, data) =>
  firebase
    .database()
    .ref(await getDbRef(ref))
    .set(data);

export const saveDataToFirebase = async (data, ref, successCallback) => {
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
  const userProfile = await getUserProfile();
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
