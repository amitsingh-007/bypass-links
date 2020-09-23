export const changeTabUrl = async (tabId, targetUrl) => {
  //eslint-disable-next-line no-undef
  targetUrl && chrome.tabs.update(tabId, { url: targetUrl });
};
