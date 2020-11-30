import promisify from "./promisifyChromeApi";

const storage = {
  set: (items) =>
    promisify((callback) => {
      chrome.storage.sync.set(items, callback);
    }),

  get: (keys) =>
    promisify((callback) => {
      chrome.storage.sync.get(keys, callback);
    }),

  remove: (key) =>
    promisify((callback) => {
      chrome.storage.sync.remove(key, callback);
    }),
};

export default storage;
