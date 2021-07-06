/* eslint-disable @typescript-eslint/no-var-requires */
const admin = require("firebase-admin");
const { getFullDbPath } = require("../../common/src/utils/firebase");

/**
 * https://github.com/vercel/vercel/issues/749
 * https://stackoverflow.com/a/50376092/8694064
 * TODO: handle for netlify
 */
const serviceAccountKey = JSON.parse(
  process.env.SERVICE_ACCOUNT_KEY.replace(/\n/g, "\\n")
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
export const getFromFirebase = async ({ ref, uid = "", isAbsolute }) =>
  admin.database().ref(getFullDbPath(ref, uid, isAbsolute)).once("value");

export const saveToFirebase = async ({ ref, uid = "", data, isAbsolute }) =>
  admin.database().ref(getFullDbPath(ref, uid, isAbsolute)).set(data);

export const removeFromFirebase = async ({ ref, uid, isAbsolute }) =>
  admin.database().ref(getFullDbPath(ref, uid, isAbsolute)).remove();
