import { useEffect } from 'react';

import { trpcApi } from '@/apis/trpcApi';
import { latestExtVersionItem } from '@/storage/items';
import { useIsSignedIn } from '@/store/firebase/useFirebaseStore';

const OUTDATED_TITLE = 'You are using older version of Bypass Links';

const showOutdated = (isOutdated: boolean) => {
  if (!isOutdated) {
    browser.action.setBadgeText({ text: '' });
    browser.action.setTitle({ title: browser.runtime.getManifest().name });
    return;
  }
  browser.action.setBadgeText({ text: '!' });
  browser.action.setBadgeBackgroundColor({ color: '#FF6B6B' });
  browser.action.setTitle({ title: OUTDATED_TITLE });
};

const useExtensionOutdated = () => {
  const isSignedIn = useIsSignedIn();

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    // Session storage clears on browser restart, which is exactly when Chrome
    // drops the badge, so one network check per browser session is enough
    const resolveLatestVersion = async () => {
      const cachedVersion = await latestExtVersionItem.getValue();
      if (cachedVersion) {
        return cachedVersion;
      }
      const { chrome: chromeData } = await trpcApi.extension.latest.query();
      await latestExtVersionItem.setValue(chromeData.version);
      return chromeData.version;
    };

    resolveLatestVersion()
      .then((latestVersion) => {
        showOutdated(latestVersion !== browser.runtime.getManifest().version);
      })
      .catch((error: unknown) => {
        console.error('Extension version check failed', error);
      });
  }, [isSignedIn]);
};

export default useExtensionOutdated;
