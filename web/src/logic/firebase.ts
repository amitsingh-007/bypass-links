import admin from "firebase-admin";
import { getFullDbPath } from "@common/utils/firebase";
import { Firebase } from "../interfaces/firebase";

/**
 * We split the credentials json that we get from firebase admin because:
 * Vercel stringifies the json and JSON.parse fails on the private key.
 *
 * SERVICE_ACCOUNT_KEY: contains the credetials json except the private_key
 * FIREBASE_PRIVATE_KEY: contains the private key
 */
const getFirebaseCredentials = () => {
  const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY ?? "");
  return admin.credential.cert({
    ...serviceAccountKey,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
  });
};

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: getFirebaseCredentials(),
    databaseURL: "https://bypass-links.firebaseio.com",
  });
}

/**
 * REALTIME DATABASE
 */
export const getFromFirebase = async ({
  ref,
  uid,
  isAbsolute,
}: Omit<Firebase, "data">) =>
  admin.database().ref(getFullDbPath(ref, uid, isAbsolute)).once("value");

export const saveToFirebase = async ({
  ref,
  uid,
  data,
  isAbsolute,
}: Firebase) =>
  admin.database().ref(getFullDbPath(ref, uid, isAbsolute)).set(data);

export const removeFromFirebase = async ({
  ref,
  uid,
  isAbsolute,
}: Omit<Firebase, "data">) =>
  admin.database().ref(getFullDbPath(ref, uid, isAbsolute)).remove();
