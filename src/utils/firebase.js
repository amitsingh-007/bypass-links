import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDiMRlBhW36sLjEADoQj9T5L1H-hIDUAso",
  authDomain: "bypass-links.firebaseapp.com",
  databaseURL: "https://bypass-links.firebaseio.com",
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
