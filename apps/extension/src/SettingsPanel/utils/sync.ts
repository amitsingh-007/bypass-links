import { FIREBASE_DB_REF, STORAGE_KEYS } from '@bypass/shared';
import storage from '@helpers/chrome/storage';
import { getFromFirebase } from '@helpers/firebase/database';
import { ISettings } from '../interfaces/settings';

export const syncSettingsToStorage = async () => {
  const settings = await getFromFirebase<ISettings>(FIREBASE_DB_REF.settings);
  await storage.set({ [STORAGE_KEYS.settings]: settings ?? {} });
  console.log('Settings is set to', settings);
};

export const resetSettings = async () => {
  await storage.remove(STORAGE_KEYS.settings);
};