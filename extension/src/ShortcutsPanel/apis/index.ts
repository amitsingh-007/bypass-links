import { IShortcut } from "@common/interfaces/shortcuts";
import fetchApi from "@common/utils/fetch";
import { getUserId } from "GlobalUtils/common";

export const saveShortcuts = async (
  shortcuts: IShortcut[]
): Promise<boolean> => {
  const userId = await getUserId();
  const { isSuccess } = await fetchApi<{ isSuccess: boolean }>(
    `/api/shortcuts?uid=${userId}`,
    {
      method: "POST",
      body: JSON.stringify({ shortcuts }),
    }
  );
  return isSuccess;
};
