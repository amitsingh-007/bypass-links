import { fetchShortcuts } from "GlobalApis/shortcuts";
import { STORAGE_KEYS } from "GlobalConstants";
import storage from "GlobalHelpers/chrome/storage";
import tabs from "GlobalHelpers/chrome/tabs";
import { getShortcuts } from "GlobalHelpers/fetchFromStorage";
import { getUserId } from "GlobalUtils/common";

export const redirect = async (tabId: number, url: URL) => {
  const shortcuts = await getShortcuts();
  const shortcut = shortcuts.find((x) => x.alias === url.href);
  if (shortcut) {
    await tabs.update(tabId, { url: shortcut.url });
  }
};

export const syncShortcutsToStorage = async () => {
  const userId = await getUserId();
  const shortcuts = await fetchShortcuts(userId || "");
  await storage.set({ [STORAGE_KEYS.shortcuts]: shortcuts });
  console.log(`Shortcuts is set to`, shortcuts);
};

export const resetShortcuts = async () => {
  await storage.remove(STORAGE_KEYS.shortcuts);
};
