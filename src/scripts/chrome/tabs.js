import promisify from "./promisifyChromeApi";

const tabs = {
  create: (options) =>
    promisify((callback) => {
      chrome.tabs.create(options, callback);
    }),
};

export default tabs;
