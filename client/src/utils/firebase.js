import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

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
export const googleSignIn = () =>
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());

export const googleSignOut = () => firebase.auth().signOut();

/**
 * REALTIME DATABASE
 */
export const getFromFirebase = async (ref) =>
  firebase.database().ref(ref).once("value");

export const saveToFirebase = async (ref, data) =>
  firebase.database().ref(ref).set(data);

export const getByKey = (ref, key) =>
  firebase.database().ref(ref).child(key).once("value");

export const searchOnKey = (ref, key) =>
  firebase.database().ref(ref).orderByKey().equalTo(key).once("value");

export const searchOnValue = (ref, field, value) =>
  firebase.database().ref(ref).orderByChild(field).equalTo(value).once("value");

export const upateValueInFirebase = (ref, key, value) =>
  firebase.database().ref(ref).child(key).set(value);

export const updateMany = (ref, updates) =>
  firebase.database().ref(ref).update(updates);

export const copyToFallbackDB = async (dbRef) => {
  const fallbackDbRef = `fallback/${dbRef}`;
  const snapshot = await getFromFirebase(dbRef);
  await saveToFirebase(fallbackDbRef, snapshot.val());
  console.log(`Updated ${fallbackDbRef} with ${dbRef}`);
};

export const saveDataToFirebase = async (data, ref, successCallback) => {
  await copyToFallbackDB(ref);
  return new Promise((resolve, reject) => {
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
export const uploadImageToFirebase = (blob, path) =>
  firebase.storage().ref().child(path).put(blob, {
    contentType: blob.type,
  });

export const getImageFromFirebase = (ref) =>
  firebase.storage().ref().child(ref).getDownloadURL();

export const removeImageFromFirebase = (ref) =>
  firebase.storage().ref().child(ref).delete();
