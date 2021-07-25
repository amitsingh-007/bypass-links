import { IBypassSite } from "@common/interfaces/bypassSites";
import fetchApi from "@common/utils/fetch";
import { getUserId } from "GlobalUtils/common";

export const fetchBypassSites = async (): Promise<IBypassSite[]> => {
  const userId = await getUserId();
  const { bypassSites } = await fetchApi<{ bypassSites: IBypassSite[] }>(
    `/api/bypass-sites?uid=${userId}`
  );
  return bypassSites;
};
