import promisify from "./promisifyChromeApi";

const tabs = {
  create: (options) =>
    promisify((callback) => {
      chrome.tabs.create(options, callback);
    }),

  update: (tabId, options) =>
    promisify((callback) => {
      chrome.tabs.update(tabId, options, callback);
    }),

  query: (options) =>
    promisify((callback) => {
      chrome.tabs.query(options, callback);
    }),
};

export const getCurrentTab = () =>
  tabs.query({
    active: true,
    currentWindow: true,
  });

export default tabs;
