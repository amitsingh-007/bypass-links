import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import { getUserProfile } from "GlobalHelpers/fetchFromStorage";
import { getFullDbPath } from "@common/utils/firebase";
import { FIREBASE_DB_REF } from "@common/constants/firebase";

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
export const googleSignIn = (token: string) =>
  firebase
    .auth()
    .signInWithCredential(
      firebase.auth.GoogleAuthProvider.credential(null, token)
    );

export const googleSignOut = () => firebase.auth().signOut();

/**
 * REALTIME DATABASE
 */
const getDbRef = async (ref: string) => {
  const userProfile = await getUserProfile();
  return getFullDbPath(ref, userProfile.uid);
};

export const getFromFirebase = async <T>(ref: string) => {
  const snapshot = await firebase
    .database()
    .ref(await getDbRef(ref))
    .once("value");
  return (snapshot.val() || {}) as T;
};

export const saveToFirebase = async (ref: string, data: any) =>
  firebase
    .database()
    .ref(await getDbRef(ref))
    .set(data);

export const saveDataToFirebase = async (
  data: any,
  ref: FIREBASE_DB_REF,
  successCallback?: () => Promise<void>
): Promise<boolean> => {
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
