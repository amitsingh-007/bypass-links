import promisify from "./promisifyChromeApi";

const tabs = {
  create: (options) =>
    promisify((callback) => {
      chrome.tabs.create(options, callback);
    }),

  remove: (tabId) =>
    promisify((callback) => {
      chrome.tabs.remove(tabId, callback);
    }),

  update: (tabId, options) =>
    promisify((callback) => {
      chrome.tabs.update(tabId, options, callback);
    }),

  goBack: (tabId) =>
    promisify((callback) => {
      chrome.tabs.goBack(tabId, callback);
    }),

  query: (options) =>
    promisify((callback) => {
      chrome.tabs.query(options, callback);
    }),

  executeScript: (tabId, options) =>
    promisify((callback) => {
      chrome.tabs.executeScript(tabId, options, callback);
    }),
};

export const getCurrentTab = async () => {
  const [currentTab] = await tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentTab;
};

export default tabs;
