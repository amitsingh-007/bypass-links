import Logging from '@/logging';
import { getIsExtensionActive, setExtStateInStorage } from '@/utils/common';
import { getCurrentTab } from '@/utils/tabs';
import { EXTENSION_STATE } from '@constants/index';
import { getExtensionState } from '@helpers/fetchFromStorage';
import { bypass } from './bypass';
import turnOffInputSuggestions from './misc/turnOffInputSuggestions';
import { redirect } from './redirect';
import { checkForUpdates, isValidUrl, setExtensionIcon } from './utils';
import { receiveRuntimeMessage } from './utils/receiveRuntimeMessage';

Logging.init();

const red = '#FF6B6B';

// First time extension install
chrome.runtime.onInstalled.addListener(() => {
  setExtStateInStorage(EXTENSION_STATE.ACTIVE);
});

// Listen when the browser is opened
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local
    .get(['extState', 'hasPendingBookmarks', 'hasPendingPersons'])
    .then(async ({ extState, hasPendingBookmarks, hasPendingPersons }) => {
      await setExtensionIcon({
        extState,
        hasPendingBookmarks,
        hasPendingPersons,
      });
    });
  checkForUpdates().then((isUsingLatest) => {
    if (!isUsingLatest) {
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: red });
      chrome.action.setTitle({
        title: 'You are using older version of Bypass Links',
      });
    }
  });
});

const onPageLoad = async (tabId: number, url: string) => {
  if (!isValidUrl(url)) {
    return;
  }
  const extState = await getExtensionState();
  if (!getIsExtensionActive(extState)) {
    return;
  }

  let tab = await getCurrentTab();
  if (isValidUrl(tab.url)) {
    turnOffInputSuggestions(tabId);
  }
  tab = await getCurrentTab();
  if (isValidUrl(tab.url)) {
    bypass(tabId, new URL(tab.url as string));
  }
  tab = await getCurrentTab();
  if (isValidUrl(tab.url)) {
    redirect(tabId, new URL(tab.url as string));
  }
};

// Listen tab url change
chrome.tabs.onUpdated.addListener((tabId, changeInfo) =>
  onPageLoad(tabId, changeInfo?.url ?? '')
);

/**
 * NOTE: Can remove chrome.tabs.onUpdated in favor of this
 * @link https://stackoverflow.com/questions/16949810/how-can-i-run-this-script-when-the-tab-reloads-chrome-extension
 */
chrome.webNavigation.onCommitted.addListener((details) => {
  if (['reload'].includes(details.transitionType)) {
    chrome.webNavigation.onCompleted.addListener(function onComplete({
      tabId,
    }) {
      onPageLoad(tabId, details.url);
      chrome.webNavigation.onCompleted.removeListener(onComplete);
    });
  }
});

// Listen to dispatched messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  receiveRuntimeMessage(message, sendResponse);
  return true;
});

// Listen to chrome storage changes
chrome.storage.onChanged.addListener((changedObj, storageType) => {
  if (storageType !== 'local') {
    return;
  }
  const { extState, hasPendingBookmarks, hasPendingPersons } = changedObj;
  if (extState || hasPendingBookmarks || hasPendingPersons) {
    setExtensionIcon({
      extState: extState?.newValue,
      hasPendingBookmarks: hasPendingBookmarks?.newValue,
      hasPendingPersons: hasPendingPersons?.newValue,
    });
  }
});
