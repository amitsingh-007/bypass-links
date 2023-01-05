import { EXTENSION_STATE } from '@constants/index';
import action from '@helpers/chrome/action';
import { getExtensionState } from '@helpers/fetchFromStorage';
import { api } from '../../utils/api';
import { getIsExtensionActive } from '../../utils/common';

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
  const { version: latestVersion } = await api.extension.latest.query();
  const { version: currentVersion } = chrome.runtime.getManifest();
  return latestVersion === currentVersion;
};
