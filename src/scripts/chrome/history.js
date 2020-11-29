import promisify from "./promisifyChromeApi";

const history = {
  deleteRange: (options) =>
    promisify((callback) => {
      chrome.history.deleteRange(options, callback);
    }),
};

export default history;
