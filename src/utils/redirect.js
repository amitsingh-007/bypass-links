import storage from "ChromeApi/storage";
import tabs from "ChromeApi/tabs";
import { getMappedRedirections } from "GlobalUtils/background";

let REDIRECTIONS = null;

const getRedirections = async () => {
  if (!REDIRECTIONS) {
    const { redirections } = await storage.get(["redirections"]);
    REDIRECTIONS = getMappedRedirections(redirections);
  }
  return REDIRECTIONS || {};
};

export const redirect = async (tabId, url) => {
  const redirections = await getRedirections();
  const redirectUrl = redirections[btoa(url.href)];
  if (redirectUrl) {
    await tabs.update(tabId, { url: atob(redirectUrl) });
  }
};

export const resetRedirections = () => {
  REDIRECTIONS = null;
};
