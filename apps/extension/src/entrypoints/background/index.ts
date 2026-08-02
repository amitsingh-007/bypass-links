import { defineBackground } from 'wxt/utils/define-background';

import { EExtensionState } from '@/constants';
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
     * Two listeners registered once, rather than nesting an onCompleted
     * listener per reload. The nested version was neither tab-filtered nor
     * reliably removed: the first onCompleted from *any* tab consumed it, so a
     * reload of tab A could fire onPageLoad against tab B, and a tab closed
     * before completing leaked its listener for the worker's lifetime.
     */
    const reloadingTabIds = new Set<number>();

    browser.webNavigation.onCommitted.addListener((details) => {
      if (details.transitionType === 'reload') {
        reloadingTabIds.add(details.tabId);
      }
    });

    browser.webNavigation.onCompleted.addListener(({ tabId, url }) => {
      if (reloadingTabIds.delete(tabId)) {
        onPageLoad(tabId, url);
      }
    });

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
      const changedKeys = Object.keys(changes);
      if (
        changedKeys.includes('extState') ||
        changedKeys.includes('hasPendingBookmarks') ||
        changedKeys.includes('hasPendingPersons')
      ) {
        void updateIcon();
      }
    });
  },
});
