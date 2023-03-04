import scripting from '@/utils/scripting';

export const bypassSingleLinkOnPage = async (
  selectorFn: () => { links: string[] | null },
  tabId: number
) => {
  const response = await scripting.executeScript({
    target: { tabId },
    func: selectorFn,
  });
  const { result } = response[0];
  const targetUrl = result?.links?.[0];
  if (targetUrl) {
    chrome.tabs.update(tabId, { url: targetUrl });
  }
};
