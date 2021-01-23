import promisify from "./promisifyChromeApi";

const browserAction = {
  setIcon: (options) =>
    promisify((callback) => {
      chrome.browserAction.setIcon(options, callback);
    }),
};

export default browserAction;
