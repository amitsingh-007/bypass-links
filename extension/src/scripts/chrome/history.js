import promisify from "./promisifyChromeApi";

const history = {
  deleteRange: (options) =>
    promisify((callback) => {
      chrome.history.deleteRange(options, callback);
    }),

  search: (options) =>
    promisify((callback) => {
      chrome.history.search(options, callback);
    }),
};

export default history;
