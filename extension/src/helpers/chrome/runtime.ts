import promisify from "./promisifyChromeApi";

const runtime = {
  sendMessage: <T>(messageObj: any) =>
    promisify<T>((callback: any) => {
      chrome.runtime.sendMessage(messageObj, callback);
    }),
};

export default runtime;
