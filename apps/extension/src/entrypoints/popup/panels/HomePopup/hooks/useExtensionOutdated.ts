import { useEffect } from 'react';

import { trpcApi } from '@/apis/trpcApi';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useOutdatedExtensionStore from '@/store/outdatedExtension';

const ONE_HOUR_MS = 1000 * 60 * 60;

const isCheckDue = () => {
  const { lastChecked } = useOutdatedExtensionStore.getState();
  return Date.now() - (lastChecked ?? 0) > ONE_HOUR_MS;
};

const red = '#FF6B6B';

const markOutdated = () => {
  browser.action.setBadgeText({ text: '!' });
  browser.action.setBadgeBackgroundColor({ color: red });
  browser.action.setTitle({
    title: 'You are using older version of Bypass Links',
  });
};

const useExtensionOutdated = () => {
  // A [] dep would miss it: sign-in is set by the auth effect, after mount
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);

  useEffect(() => {
    if (!isSignedIn || !isCheckDue()) {
      return;
    }
    trpcApi.extension.latest.query().then(({ chrome: chromeData }) => {
      if (chromeData.version !== browser.runtime.getManifest().version) {
        markOutdated();
      }
      useOutdatedExtensionStore.getState().setLastChecked(Date.now());
    });
  }, [isSignedIn]);
};

export default useExtensionOutdated;
