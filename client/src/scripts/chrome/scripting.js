import promisify from "./promisifyChromeApi";

const scripting = {
  executeScript: (tabId, options) =>
    promisify((callback) => {
      chrome.scripting.executeScript(tabId, options, callback);
    }),
};

export default scripting;
