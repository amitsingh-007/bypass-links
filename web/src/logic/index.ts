export const get2FATitle = () =>
  __PROD__ ? process.env.SITE_NAME : "Bypass Links - Local";

export const getUpdates = <T extends U, U extends { [key: string]: any }>(
  allList: T[],
  updateList: U[],
  identifier: keyof U
) => {
  const updateListSet = new Set(updateList.map((x) => x[identifier]));
  const deleteList = allList.reduce<T[]>((finalList, data) => {
    if (!updateListSet.has(data[identifier])) {
      finalList.push(data);
    }
    return finalList;
  }, []);
  return { updateList, deleteList };
};
