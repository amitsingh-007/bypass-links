export const getFromLocalStorage = <T>(key: string) => {
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const setToLocalStorage = (key: string, value: any) =>
  localStorage.setItem(key, JSON.stringify(value));

export const removeFromLocalStorage = (key: string) =>
  localStorage.removeItem(key);

export const isExistsInLocalStorage = (key: string) => key in localStorage;
