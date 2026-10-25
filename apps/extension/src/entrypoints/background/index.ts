import { defineBackground } from 'wxt/utils/define-background';

import { EExtensionState } from '@/constants';
import {
  extStateItem,
  hasPendingBookmarksItem,
  hasPendingPersonsItem,
  mappedRedirectionsItem,
} from '@/storage/items';
import { RuntimeInputSchema } from '@/utils/sendRuntimeMessage';

import turnOffInputSuggestions from './misc/turnOffInputSuggestions';
import { getExtState, setExtState } from './navigationCache';
import {
  rebuildRedirectRules,
  startShortcutHistoryWatch,
} from './redirections/redirect';
import { isValidUrl, setExtensionIcon } from './utils';
import { receiveRuntimeMessage } from './utils/receiveRuntimeMessage';

const onPageLoad = async (tabId: number, url: string) => {
  if (!isValidUrl(url)) {
    return;
  }
  try {
    const [extState, tab] = await Promise.all([
      getExtState(),
      browser.tabs.get(tabId),
    ]);
    if (extState !== EExtensionState.ACTIVE) {
      return;
    }
    // Superseded by a newer navigation while we awaited
    if (tab.url !== url) {
      return;
    }

    await turnOffInputSuggestions(tabId);
  } catch (error) {
    // The tab can close or navigate on mid-flight, so these reject routinely
    console.debug('Skipped page load handling for', url, error);
  }
};

const isMainFrame = (frameId: number) => frameId === 0;

const updateIcon = async () => {
  const [extState, hasPendingBookmarks, hasPendingPersons] = await Promise.all([
    getExtState(),
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
    extStateItem.watch((value) => {
      setExtState(value);
      void updateIcon();
      void rebuildRedirectRules();
    });
    mappedRedirectionsItem.watch(rebuildRedirectRules);
    hasPendingBookmarksItem.watch(updateIcon);
    hasPendingPersonsItem.watch(updateIcon);

    browser.runtime.onInstalled.addListener(() => {
      void extStateItem
        .setValue(EExtensionState.ACTIVE)
        .then(rebuildRedirectRules)
        .catch(console.error);
    });

    browser.runtime.onStartup.addListener(updateIcon);

    browser.webNavigation.onBeforeNavigate.addListener(({ frameId, url }) => {
      if (isMainFrame(frameId)) {
        void startShortcutHistoryWatch(url).catch((error) =>
          console.error('Could not start shortcut history watch', error)
        );
      }
    });

    browser.tabs.onUpdated.addListener(async (tabId, changeInfo) =>
      onPageLoad(tabId, changeInfo?.url ?? '')
    );

    // Registered once, not per reload: the old nested listener was neither
    // tab-filtered nor reliably removed. frameId 0 keeps subframes from eating it.
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

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const result = RuntimeInputSchema.safeParse(message);
      if (!result.success) {
        return false;
      }
      receiveRuntimeMessage(result.data, sendResponse);
      return true;
    });
  },
});
