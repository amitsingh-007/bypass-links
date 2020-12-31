import promisify from "./promisifyChromeApi";

const storage = {
  set: (items) =>
    promisify((callback) => {
      chrome.storage.local.set(items, callback);
    }),

  get: (array_of_keys) =>
    promisify((callback) => {
      chrome.storage.local.get(array_of_keys, callback);
    }),

  remove: (key) =>
    promisify((callback) => {
      chrome.storage.local.remove(key, callback);
    }),
};

export default storage;
