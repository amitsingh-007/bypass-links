import promisify from "./promisifyChromeApi";

const identity = {
  getAuthToken: (options) =>
    promisify((callback) => {
      chrome.identity.getAuthToken(options, callback);
    }),
};

export default identity;
