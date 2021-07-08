import promisify from "./promisifyChromeApi";

const runtime = {
  sendMessage: (messageObj: any) =>
    promisify<any>((callback: any) => {
      chrome.runtime.sendMessage(messageObj, callback);
    }),
};

export default runtime;
