import { BYPASS_KEYS } from "GlobalConstants";
import { getHostnameAlias } from "GlobalUtils/common";
import { forumsLogic } from "./forums";

const logicAndHostnameMapping = {
  [BYPASS_KEYS.FORUMS]: forumsLogic,
};

const getLogicExecutor = async (url: URL) => {
  const hostnameAlias = await getHostnameAlias(url.hostname);
  if (logicAndHostnameMapping[hostnameAlias]) {
    return logicAndHostnameMapping[hostnameAlias];
  }
  return null;
};

const siteSpecificLogic = async (tabId: number, url: URL) => {
  const executor = await getLogicExecutor(url);
  if (executor) {
    await executor(url, tabId);
  }
};

export default siteSpecificLogic;
