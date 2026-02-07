import { getExtensionState } from '@helpers/fetchFromStorage';
import turnOffInputSuggestions from './misc/turnOffInputSuggestions';
import { redirect } from './redirections';
import { isValidTabUrl, isValidUrl, setExtensionIcon } from './utils';
import { receiveRuntimeMessage } from './utils/receiveRuntimeMessage';
import { type RuntimeInput } from '@/utils/sendRuntimeMessage';
import { getIsExtensionActive, setExtStateInStorage } from '@/utils/common';
import { EExtensionState } from '@/constants';

// First time extension install
chrome.runtime.onInstalled.addListener(() => {
  setExtStateInStorage(EExtensionState.ACTIVE);
});

// Listen when the browser is opened
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local
    .get<{
      extState: EExtensionState;
      hasPendingBookmarks: boolean;
      hasPendingPersons: boolean;
    }>(['extState', 'hasPendingBookmarks', 'hasPendingPersons'])
    .then(async ({ extState, hasPendingBookmarks, hasPendingPersons }) => {
      await setExtensionIcon({
        extState,
        hasPendingBookmarks,
        hasPendingPersons,
      });
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

  // Below if() checks avoid the scenario where url changes after the page is loaded
  if (await isValidTabUrl(tabId)) {
    redirect(tabId, new URL(url));
  }
  if (await isValidTabUrl(tabId)) {
    turnOffInputSuggestions(tabId);
  }
};

// Listen tab url change
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) =>
  onPageLoad(tabId, changeInfo?.url ?? '')
);

/**
 * NOTE: Can remove chrome.tabs.onUpdated in favor of this
 * @link https://stackoverflow.com/questions/16949810/how-can-i-run-this-script-when-the-tab-reloads-chrome-extension
 */
chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.transitionType === 'reload') {
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
  receiveRuntimeMessage(message as RuntimeInput, sendResponse);
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
      extState: extState?.newValue as EExtensionState,
      hasPendingBookmarks: hasPendingBookmarks?.newValue as boolean,
      hasPendingPersons: hasPendingPersons?.newValue as boolean,
    });
  }
});
