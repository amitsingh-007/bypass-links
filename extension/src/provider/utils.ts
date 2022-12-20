import storage from '@helpers/chrome/storage';

export const getFromChromeStorage = async <
  T extends {
    [key: string]: any;
  }
>(
  key: string
) => {
  const data = <T>await storage.get(key);
  return data ? data[key] : null;
};

export const setToChromeStorage = async (key: string, value: any) =>
  storage.set({ [key]: value });
