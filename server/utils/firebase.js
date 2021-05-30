const admin = require("firebase-admin");
const { getFullDbPath } = require("../../common/src/utils/firebase");

const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: "https://bypass-links.firebaseio.com",
  });
}

/**
 * REALTIME DATABASE
 */
const getFromFirebase = async ({ ref, uid }) =>
  admin.database().ref(getFullDbPath(ref, uid, false)).once("value");

const saveToFirebase = async ({ ref, uid, data, isFallback = false }) =>
  admin.database().ref(getFullDbPath(ref, uid, isFallback)).set(data);

const removeFromFirebase = async ({ ref, uid }) =>
  admin.database().ref(getFullDbPath(ref, uid, false)).remove();

module.exports = {
  getFromFirebase,
  saveToFirebase,
  removeFromFirebase,
};
