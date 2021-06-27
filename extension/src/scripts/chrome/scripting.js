import promisify from "./promisifyChromeApi";

const scripting = {
  executeScript: (options) =>
    promisify((callback) => {
      chrome.scripting.executeScript(options, callback);
    }),
};

export default scripting;
