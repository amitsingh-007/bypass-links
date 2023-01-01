import promisify from './promisifyChromeApi';

const identity = {
  getAuthToken: (options: chrome.identity.TokenDetails) =>
    promisify<string>((callback: any) => {
      chrome.identity.clearAllCachedAuthTokens(() => {
        chrome.identity.getAuthToken(options, callback);
      });
    }),

  removeCachedAuthToken: (options: chrome.identity.TokenInformation) =>
    promisify<void>((callback: any) => {
      chrome.identity.removeCachedAuthToken(options, callback);
    }),
};

export default identity;
