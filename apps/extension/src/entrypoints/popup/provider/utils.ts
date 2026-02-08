export const getFromChromeStorage = async (key: string): Promise<any> => {
  const data = await browser.storage.local.get(key);
  return data ? data[key] : null;
};

export const setToChromeStorage = async (key: string, value: any) =>
  browser.storage.local.set({ [key]: value });
