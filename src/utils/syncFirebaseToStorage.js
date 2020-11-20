import firebase from "./firebase";

const getFromFirebase = () =>
  firebase.database().ref("redirections").once("value");

const syncToStorage = (snapshot) => {
  const redirections = snapshot.val();
  chrome.storage.sync.set({ redirections }, () => {
    console.log(`redirections is set to `, redirections);
  });
};

export const syncFirebaseToStorage = () => {
  getFromFirebase().then(syncToStorage);
};
