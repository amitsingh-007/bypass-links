import { defineBackground } from 'wxt/utils/define-background';
import turnOffInputSuggestions from './misc/turnOffInputSuggestions';
import { redirect } from './redirections';
import { isValidTabUrl, isValidUrl, setExtensionIcon } from './utils';
import { receiveRuntimeMessage } from './utils/receiveRuntimeMessage';
import { type RuntimeInput } from '@/utils/sendRuntimeMessage';
import { getIsExtensionActive } from '@/utils/common';
import { EExtensionState } from '@/constants';
import {
  extStateItem,
  hasPendingBookmarksItem,
  hasPendingPersonsItem,
} from '@/storage/items';

export default defineBackground({
  type: 'module',
  main() {
    // First time extension install
    browser.runtime.onInstalled.addListener(() => {
      extStateItem.setValue(EExtensionState.ACTIVE);
    });

    // Listen when the browser is opened
    browser.runtime.onStartup.addListener(() => {
      browser.storage.local
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
      const extState = await extStateItem.getValue();
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
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo) =>
      onPageLoad(tabId, changeInfo?.url ?? '')
    );

    /**
     * NOTE: Can remove browser.tabs.onUpdated in favor of this
     * @link https://stackoverflow.com/questions/16949810/how-can-i-run-this-script-when-the-tab-reloads-chrome-extension
     */
    browser.webNavigation.onCommitted.addListener((details) => {
      if (details.transitionType === 'reload') {
        browser.webNavigation.onCompleted.addListener(function onComplete({
          tabId,
        }) {
          onPageLoad(tabId, details.url);
          browser.webNavigation.onCompleted.removeListener(onComplete);
        });
      }
    });

    // Listen to dispatched messages
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      receiveRuntimeMessage(message as RuntimeInput, sendResponse);
      return true;
    });

    extStateItem.watch(async (newValue) => {
      setExtensionIcon({
        extState: newValue,
        hasPendingBookmarks: await hasPendingBookmarksItem.getValue(),
        hasPendingPersons: await hasPendingPersonsItem.getValue(),
      });
    });

    hasPendingBookmarksItem.watch(async (newValue) => {
      setExtensionIcon({
        extState: await extStateItem.getValue(),
        hasPendingBookmarks: newValue,
        hasPendingPersons: await hasPendingPersonsItem.getValue(),
      });
    });

    hasPendingPersonsItem.watch(async (newValue) => {
      setExtensionIcon({
        extState: await extStateItem.getValue(),
        hasPendingBookmarks: await hasPendingBookmarksItem.getValue(),
        hasPendingPersons: newValue,
      });
    });
  },
});
