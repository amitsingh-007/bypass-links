import promisify from "./promisifyChromeApi";

const action = {
  setIcon: (options: chrome.action.TabIconDetails) =>
    promisify<void>((callback: any) => {
      chrome.action.setIcon(options, callback);
    }),
};

export default action;
