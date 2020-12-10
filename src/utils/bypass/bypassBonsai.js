import { HOSTNAME } from "GlobalConstants/";
import { changeTabUrl } from "./changeTabUrl";

export const bypassBonsai = async (url, tabId) => {
  if (url.hostname !== HOSTNAME.BONSAI) {
    return;
  }
  const encodedTargetUrl = url.searchParams.get("adsurlkkk");
  const targetUrl = encodedTargetUrl ? atob(encodedTargetUrl) : null;
  await changeTabUrl(tabId, targetUrl);
};
