import { ILastVisited } from "@common/interfaces/lastVisited";
import fetchApi from "@common/utils/fetch";
import { getUserId } from "GlobalUtils/common";

export const getLastVisited = async (): Promise<ILastVisited[]> => {
  const userId = await getUserId();
  const { lastVisited } = await fetchApi<{ lastVisited: ILastVisited[] }>(
    `/api/last-visited?uid=${userId}`
  );
  return lastVisited;
};

export const saveLastVisited = async (
  lastVisited: ILastVisited
): Promise<boolean> => {
  const userId = await getUserId();
  const { isSuccess } = await fetchApi<{ isSuccess: boolean }>(
    `/api/last-visited?uid=${userId}`,
    {
      method: "POST",
      body: JSON.stringify({ lastVisited }),
    }
  );
  return isSuccess;
};
