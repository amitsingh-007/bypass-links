import promisify from './promisifyChromeApi';

const tabs = {
  create: (options: chrome.tabs.CreateProperties) =>
    promisify<chrome.tabs.Tab>((callback?: any) => {
      chrome.tabs.create(options, callback);
    }),

  remove: (tabId: number) =>
    promisify<void>((callback?: any) => {
      chrome.tabs.remove(tabId, callback);
    }),

  update: (tabId: number, options: chrome.tabs.UpdateProperties) =>
    promisify<chrome.tabs.Tab | undefined>((callback?: any) => {
      chrome.tabs.update(tabId, options, callback);
    }),

  goBack: (tabId: number) =>
    promisify<void>((callback?: any) => {
      chrome.tabs.goBack(tabId, callback);
    }),

  query: (options: chrome.tabs.QueryInfo) =>
    promisify<chrome.tabs.Tab[]>((callback: any) => {
      chrome.tabs.query(options, callback);
    }),
};

export const getCurrentTab = async () => {
  const [currentTab] = await tabs.query({
    active: true,
    currentWindow: true,
  });
  return currentTab;
};

export default tabs;
