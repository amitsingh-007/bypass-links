import promisify from "./promisifyChromeApi";

const identity = {
  getAuthToken: (options) =>
    promisify((callback) => {
      chrome.identity.getAuthToken(options, callback);
    }),

  removeCachedAuthToken: (options) =>
    promisify((callback) => {
      chrome.identity.removeCachedAuthToken(options, callback);
    }),
};

export default identity;
