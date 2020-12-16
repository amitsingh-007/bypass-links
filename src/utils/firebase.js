import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDiMRlBhW36sLjEADoQj9T5L1H-hIDUAso",
  authDomain: "bypass-links.firebaseapp.com",
  databaseURL: `https://bypass-links.firebaseio.com/`,
  projectId: "bypass-links",
  storageBucket: "bypass-links.appspot.com",
  messagingSenderId: "603462573180",
  appId: "1:603462573180:web:317c7f02f1f66b836f3df9",
  measurementId: "G-ZGKPZFJ01Z",
};

firebase.initializeApp(firebaseConfig);

export const googleSignIn = () =>
  firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());

export const googleSignOut = () => firebase.auth().signOut();

export const getFromFirebase = (ref) =>
  firebase.database().ref(ref).once("value");

export const saveToFirebase = (ref, data) =>
  firebase.database().ref(ref).set(data);

export const getDefaultsFromFirebase = (ref) =>
  firebase
    .database()
    .ref(ref)
    .orderByChild("isDefault")
    .equalTo(true)
    .once("value");

export const upateValueInFirebase = (ref, key, value) =>
  firebase.database().ref(ref).child(key).set(value);

export const removeFromFirebase = (ref, key) =>
  firebase.database().ref(ref).child(key).remove();

export const searchByKey = (ref, key) =>
  firebase.database().ref(ref).orderByKey().equalTo(key).once("value");

export const copyToFallbackDB = async (dbRef, fallbackDbRef) => {
  const snapshot = await getFromFirebase(dbRef);
  await saveToFirebase(fallbackDbRef, snapshot.val());
  console.log(`Updated ${fallbackDbRef} with ${dbRef}`);
};
