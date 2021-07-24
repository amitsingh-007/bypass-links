import { IShortcut } from "@common/interfaces/shortcuts";
import fetchApi from "@common/utils/fetch";

export const fetchShortcuts = async (uid: string): Promise<IShortcut[]> => {
  const { shortcuts } = await fetchApi<{ shortcuts: IShortcut[] }>(
    `/api/shortcuts?uid=${uid}`
  );
  return shortcuts;
};
