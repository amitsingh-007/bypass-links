import promisify from './promisifyChromeApi';

const windows = {
  create: (options: chrome.windows.CreateData) =>
    promisify<chrome.windows.Window | undefined>((callback?: any) => {
      chrome.windows.create(options, callback);
    }),
};

export default windows;
