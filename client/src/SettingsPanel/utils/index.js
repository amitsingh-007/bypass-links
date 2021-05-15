import storage from "ChromeApi/storage";
import { STORAGE_KEYS } from "GlobalConstants/index";

export const getUserProfile = async () => {
  const { [STORAGE_KEYS.userProfile]: userProfile } = await storage.get(
    STORAGE_KEYS.userProfile
  );
  return userProfile;
};
