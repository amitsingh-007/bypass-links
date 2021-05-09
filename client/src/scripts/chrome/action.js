import promisify from "./promisifyChromeApi";

const action = {
  setIcon: (options) =>
    promisify((callback) => {
      chrome.action.setIcon(options, callback);
    }),
};

export default action;
