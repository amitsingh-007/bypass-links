// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export const getFromLocalStorage = <T>(key: string) => {
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : null;
};

export const setToLocalStorage = (key: string, value: any) =>
  localStorage.setItem(key, JSON.stringify(value));
