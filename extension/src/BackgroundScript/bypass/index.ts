import { fetchBypassSites } from "GlobalApis/bypassSites";
import { STORAGE_KEYS } from "GlobalConstants";
import storage from "GlobalHelpers/chrome/storage";
import { getBypassExecutor } from "./bypassUtils";

export const bypass = async (tabId: number, url: URL) => {
  const bypassExecutor = await getBypassExecutor(url);
  if (bypassExecutor) {
    await bypassExecutor(url, tabId);
  }
};

export const syncBypassToStorage = async () => {
  const response = await fetchBypassSites();
  const bypass = response.reduce<Record<string, string>>((obj, x) => {
    obj[x.hostname] = x.name;
    return obj;
  }, {});
  await storage.set({ [STORAGE_KEYS.bypass]: bypass });
  console.log("Bypass is set to", bypass);
};

export const resetBypass = async () => {
  await storage.remove(STORAGE_KEYS.bypass);
};
