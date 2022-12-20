import action from '@helpers/chrome/action';
import scripting from '@helpers/chrome/scripting';
import { getCurrentTab } from '@helpers/chrome/tabs';
import { getExtensionState } from '@helpers/fetchFromStorage';
import { getIsExtensionActive } from '../../utils/common';
import { EXTENSION_STATE } from '@constants/index';
import fetchApi from '@bypass/shared/utils/fetch';
import { IExtension } from '@bypass/shared/interfaces/api';

const getPageH1 = () => {
  const h1s = document.getElementsByTagName('h1');
  return h1s.length > 0 ? h1s[0].innerText : '';
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
    icon = 'assets/bypass_link_pending_32.png';
  } else {
    const newExtState = extState ?? (await getExtensionState());
    icon = getIsExtensionActive(newExtState)
      ? 'assets/bypass_link_on_32.png'
      : 'assets/bypass_link_off_32.png';
  }
  await action.setIcon({ path: icon });
};

export const checkForUpdates = async () => {
  const { version: latestVersion } = await fetchApi<IExtension>(
    '/api/extension'
  );
  const { version: currentVersion } = chrome.runtime.getManifest();
  return latestVersion === currentVersion;
};
