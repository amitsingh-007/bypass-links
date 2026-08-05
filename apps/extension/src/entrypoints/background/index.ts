import { defineBackground } from 'wxt/utils/define-background';

import { EExtensionState, ICON_KEYS } from '@/constants';
import {
  extStateItem,
  hasPendingBookmarksItem,
  hasPendingPersonsItem,
} from '@/storage/items';
import { getIsExtensionActive } from '@/utils/common';
import { type RuntimeInput } from '@/utils/sendRuntimeMessage';

import turnOffInputSuggestions from './misc/turnOffInputSuggestions';
import { redirect } from './redirections';
import { isValidTabUrl, isValidUrl, setExtensionIcon } from './utils';
import { receiveRuntimeMessage } from './utils/receiveRuntimeMessage';

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

const isMainFrame = (frameId: number) => frameId === 0;

const updateIcon = async () => {
  const [extState, hasPendingBookmarks, hasPendingPersons] = await Promise.all([
    extStateItem.getValue(),
    hasPendingBookmarksItem.getValue(),
    hasPendingPersonsItem.getValue(),
  ]);
  await setExtensionIcon({
    extState,
    hasPendingBookmarks,
    hasPendingPersons,
  });
};

export default defineBackground({
  type: 'module',
  main() {
    // First time extension install
    browser.runtime.onInstalled.addListener(() => {
      extStateItem.setValue(EExtensionState.ACTIVE);
    });

    browser.runtime.onStartup.addListener(updateIcon);

    // Listen tab url change
    browser.tabs.onUpdated.addListener(async (tabId, changeInfo) =>
      onPageLoad(tabId, changeInfo?.url ?? '')
    );

    /**
     * NOTE: Can remove browser.tabs.onUpdated in favor of this
     * @link https://stackoverflow.com/questions/16949810/how-can-i-run-this-script-when-the-tab-reloads-chrome-extension
     *
     * Registered once instead of nesting a listener per reload, which was
     * neither tab-filtered nor reliably removed. frameId 0 keeps subframes from
     * consuming the tab's pending reload.
     */
    const reloadingTabIds = new Set<number>();
    const clearReloading = ({
      tabId,
      frameId,
    }: {
      tabId: number;
      frameId: number;
    }) => {
      if (isMainFrame(frameId)) {
        reloadingTabIds.delete(tabId);
      }
    };

    browser.webNavigation.onCommitted.addListener((details) => {
      if (!isMainFrame(details.frameId)) {
        return;
      }
      // A non-reload commit supersedes any pending reload for this tab
      if (details.transitionType === 'reload') {
        reloadingTabIds.add(details.tabId);
      } else {
        reloadingTabIds.delete(details.tabId);
      }
    });

    browser.webNavigation.onCompleted.addListener(({ tabId, url, frameId }) => {
      if (isMainFrame(frameId) && reloadingTabIds.delete(tabId)) {
        onPageLoad(tabId, url);
      }
    });

    // Without this a reload that aborts leaves a marker the next unrelated
    // completion would consume
    browser.webNavigation.onErrorOccurred.addListener(clearReloading);

    browser.tabs.onRemoved.addListener((tabId) => {
      reloadingTabIds.delete(tabId);
    });

    // Listen to dispatched messages
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      receiveRuntimeMessage(message as RuntimeInput, sendResponse);
      return true;
    });

    browser.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local') {
        return;
      }
      if (ICON_KEYS.some((key) => key in changes)) {
        void updateIcon();
      }
    });
  },
});
