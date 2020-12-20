import tabs from "ChromeApi/tabs";
import { HOSTNAME } from "GlobalConstants/index";

export const bypassBonsai = async (url, tabId) => {
  if (url.hostname !== HOSTNAME.BONSAI) {
    return;
  }
  const encodedTargetUrl = url.searchParams.get("adsurlkkk");
  const targetUrl = encodedTargetUrl ? atob(encodedTargetUrl) : null;
  await tabs.update(tabId, { url: targetUrl });
};
