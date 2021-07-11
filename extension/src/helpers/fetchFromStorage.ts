import storage from "ChromeApi/storage";
import { EXTENSION_STATE, STORAGE_KEYS } from "GlobalConstants";
import { UserInfo } from "SrcPath/HomePopup/interfaces/authentication";
import { LastVisited } from "SrcPath/HomePopup/interfaces/lastVisited";
import { Redirection } from "SrcPath/ShortcutsPanel/interfaces/redirections";

export const getExtensionState = async () => {
  const { extState } = await storage.get("extState");
  return extState as EXTENSION_STATE;
};

export const getHostnames = async () => {
  const { [STORAGE_KEYS.bypass]: bypass } = await storage.get(
    STORAGE_KEYS.bypass
  );
  return (bypass || {}) as Record<string, string>;
};

export const getRedirections = async () => {
  const { [STORAGE_KEYS.redirections]: redirections } = await storage.get(
    STORAGE_KEYS.redirections
  );
  return redirections as Redirection;
};

export const getLastVisited = async (): Promise<LastVisited> => {
  const { [STORAGE_KEYS.lastVisited]: lastVisited } = await storage.get(
    STORAGE_KEYS.lastVisited
  );
  return lastVisited as LastVisited;
};

export const getUserProfile = async () => {
  const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
    STORAGE_KEYS.userProfile
  );
  return userProfile as UserInfo;
};
