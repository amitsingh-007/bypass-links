/* eslint-disable */

export const bypassLink = () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const url = tabs[0].url;
  });
};
