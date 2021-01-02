import promisify from "./promisifyChromeApi";

const windows = {
  create: (options) =>
    promisify((callback) => {
      chrome.windows.create(options, callback);
    }),
};

export default windows;
