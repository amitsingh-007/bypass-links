import { useEffect } from 'react';
import { trpcApi } from '@/apis/trpcApi';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import useOutdatedExtensionStore from '@/store/outdatedExtension';

const checkForUpdates = async () => {
  const { chrome: chromeData } = await trpcApi.extension.latest.query();
  const { version: currentVersion } = browser.runtime.getManifest();
  return chromeData.version === currentVersion;
};

const shouldCheckForUpdates = () => {
  const { isSignedIn } = useFirebaseStore.getState();
  if (!isSignedIn) {
    return false;
  }
  const { lastChecked } = useOutdatedExtensionStore.getState();
  if (!lastChecked) {
    return true;
  }
  const diff = Date.now() - lastChecked;
  return diff > 1000 * 60 * 60; // 1 hour
};

const red = '#FF6B6B';

const useExtensionOutdated = () => {
  useEffect(() => {
    if (!shouldCheckForUpdates()) {
      return;
    }
    checkForUpdates().then((isUsingLatest) => {
      if (!isUsingLatest) {
        browser.action.setBadgeText({ text: '!' });
        browser.action.setBadgeBackgroundColor({ color: red });
        browser.action.setTitle({
          title: 'You are using older version of Bypass Links',
        });
      }
      useOutdatedExtensionStore.getState().setLastChecked(Date.now());
    });
  }, []);
};

export default useExtensionOutdated;
