import tabs from "ChromeApi/tabs";

export const bypassBonsai = async (url, tabId) => {
  const encodedTargetUrl = url.searchParams.get("adsurlkkk");
  const targetUrl = encodedTargetUrl ? atob(encodedTargetUrl) : null;
  await tabs.update(tabId, { url: targetUrl });
};
