import promisify from './promisifyChromeApi';

const history = {
  deleteRange: (options: chrome.history.Range) =>
    promisify<void>((callback: any) => {
      chrome.history.deleteRange(options, callback);
    }),

  search: (options: chrome.history.HistoryQuery) =>
    promisify<chrome.history.HistoryItem[]>((callback: any) => {
      chrome.history.search(options, callback);
    }),
};

export default history;
