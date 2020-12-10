import { FIREBASE_DB_REF } from "GlobalConstants/";
import { resetRedirections } from "./bypass";
import { getFromFirebase } from "./firebase";

const syncToStorage = (snapshot) => {
  const redirections = snapshot.val();
  chrome.storage.sync.set({ redirections }, () => {
    console.log(`Redirections is set to `, redirections);
    resetRedirections();
  });
};

export const syncFirebaseToStorage = () => {
  getFromFirebase(FIREBASE_DB_REF.redirections)
    .then(syncToStorage)
    .catch((err) => {
      console.log("Error occured while fetching redirections from Firebae DB");
    });
};
