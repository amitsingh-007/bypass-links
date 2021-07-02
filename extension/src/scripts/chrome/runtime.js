import promisify from "./promisifyChromeApi";

const runtime = {
  sendMessage: (messageObj) =>
    promisify((callback) => {
      chrome.runtime.sendMessage(messageObj, callback);
    }),
};

export default runtime;
