export const getFromChromeStorage = async <
  T extends {
    [key: string]: any;
  },
>(
  key: string
) => {
  const data = <T>await chrome.storage.local.get(key);
  return data ? data[key] : null;
};

export const setToChromeStorage = async (key: string, value: any) =>
  chrome.storage.local.set({ [key]: value });
