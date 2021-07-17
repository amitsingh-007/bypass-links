import tabs from "GlobalHelpers/chrome/tabs";

export const bypassBonsai = async (url, tabId) => {
  const encodedTargetUrl = url.searchParams.get("adsurlkkk");
  const targetUrl = encodedTargetUrl ? atob(encodedTargetUrl) : null;
  await tabs.update(tabId, { url: targetUrl });
};
