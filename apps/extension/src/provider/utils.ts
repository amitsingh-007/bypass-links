export const getFromChromeStorage = async (key: string): Promise<any> => {
  const data = await chrome.storage.local.get(key);
  return data ? data[key] : null;
};

export const setToChromeStorage = async (key: string, value: any) =>
  chrome.storage.local.set({ [key]: value });
