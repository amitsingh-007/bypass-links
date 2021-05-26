import { BYPASS_KEYS } from "GlobalConstants";
import { getHostnameAlias } from "GlobalUtils/common";
import { forumsLogic } from "./forumsLogic";

const logicAndHostnameMapping = {
  [BYPASS_KEYS.FORUMS]: forumsLogic,
};

const getLogicExecutor = async (url) => {
  const hostnameAlias = await getHostnameAlias(url.hostname);
  if (logicAndHostnameMapping[hostnameAlias]) {
    return logicAndHostnameMapping[hostnameAlias];
  }
  return null;
};

const siteSpecificLogic = async (tabId, url) => {
  const executor = await getLogicExecutor(url);
  if (executor) {
    await executor(url, tabId);
  }
};

export default siteSpecificLogic;
