import promisify from "./promisifyChromeApi";

const storage = {
  set: (items) =>
    promisify((callback) => {
      chrome.storage.local.set(items, callback);
    }),

  get: (keys) =>
    promisify((callback) => {
      chrome.storage.local.get(keys, callback);
    }),

  remove: (key) =>
    promisify((callback) => {
      chrome.storage.local.remove(key, callback);
    }),
};

export default storage;
