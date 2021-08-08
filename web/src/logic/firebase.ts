import admin from "firebase-admin";
import { getFullDbPath } from "@common/utils/firebase";
import { Firebase } from "../interfaces/firebase";

const serviceAccountKey = JSON.parse(
  process.env.SERVICE_ACCOUNT_KEY?.replace(/\n/g, "\\n") ?? ""
);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
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
