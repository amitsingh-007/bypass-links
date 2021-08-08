import action from "GlobalHelpers/chrome/action";
import scripting from "GlobalHelpers/chrome/scripting";
import { getCurrentTab } from "GlobalHelpers/chrome/tabs";
import { getExtensionState } from "GlobalHelpers/fetchFromStorage";
import { isExtensionActive } from "../../utils/common";
import { EXTENSION_STATE } from "GlobalConstants";

const getPageH1 = () => {
  const h1s = document.getElementsByTagName("h1");
  return h1s.length > 0 ? h1s[0].innerText : "";
};

export const fetchPageH1 = async () => {
  const { id: tabId = -1 } = await getCurrentTab();
  const [{ result }] = await scripting.executeScript({
    target: { tabId },
    func: getPageH1,
  });
  return new Promise((resolve) => {
    resolve(result);
  });
};

export const isValidUrl = (url?: string) =>
  url && !/chrome(-extension)?:\/\/*/.test(url);

export const setExtensionIcon = async ({
  extState,
  hasPendingBookmarks,
  hasPendingPersons,
}: {
  extState?: EXTENSION_STATE;
  hasPendingBookmarks: boolean;
  hasPendingPersons: boolean;
}) => {
  let icon: string;
  if (hasPendingBookmarks === true || hasPendingPersons === true) {
    icon = "assets/bypass_link_pending_128.png";
  } else {
    const newExtState = extState ?? (await getExtensionState());
    icon = isExtensionActive(newExtState)
      ? "assets/bypass_link_on_128.png"
      : "assets/bypass_link_off_128.png";
  }
  await action.setIcon({ path: icon });
};
