import promisify from './promisifyChromeApi';

const action = {
  setIcon: (options: chrome.action.TabIconDetails) =>
    promisify<void>((callback: any) => {
      chrome.action.setIcon(options, callback);
    }),
  setBadgeText: (options: chrome.action.BadgeTextDetails) =>
    promisify<void>((callback?: any) => {
      chrome.action.setBadgeText(options, callback);
    }),
  setBadgeBackgroundColor: (
    options: chrome.action.BadgeBackgroundColorDetails
  ) =>
    promisify<void>((callback?: any) => {
      chrome.action.setBadgeBackgroundColor(options, callback);
    }),
  setTitle: (options: chrome.action.TitleDetails) =>
    promisify<void>((callback?: any) => {
      chrome.action.setTitle(options, callback);
    }),
  setBadgeWithTitle: async (text: string, color: string, title: string) => {
    await Promise.all([
      action.setBadgeText({ text }),
      action.setBadgeBackgroundColor({ color }),
      action.setTitle({ title }),
    ]);
  },
};

export default action;
