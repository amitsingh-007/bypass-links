export const changeTabUrl = async (tabId, targetUrl) => {
  console.log(`Changing tab url to ${targetUrl}`);
  //eslint-disable-next-line no-undef
  targetUrl && chrome.tabs.update(tabId, { url: targetUrl });
};
