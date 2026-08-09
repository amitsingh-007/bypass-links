import { useEffect } from 'react';

import { trpcApi } from '@/apis/trpcApi';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

const OUTDATED_TITLE = 'You are using older version of Bypass Links';

const showOutdated = (isOutdated: boolean) => {
  browser.action.setBadgeText({ text: isOutdated ? '!' : '' });
  browser.action.setBadgeBackgroundColor({ color: '#FF6B6B' });
  browser.action.setTitle({
    title: isOutdated ? OUTDATED_TITLE : browser.runtime.getManifest().name,
  });
};

const useExtensionOutdated = () => {
  // A [] dep would miss it: sign-in is set by the auth effect, after mount
  const isSignedIn = useFirebaseStore((state) => state.isSignedIn);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    // Rechecked on every open since Chrome drops the badge on browser restart
    trpcApi.extension.latest
      .query()
      .then(({ chrome: chromeData }) => {
        showOutdated(
          chromeData.version !== browser.runtime.getManifest().version
        );
      })
      .catch((error: unknown) => {
        console.error('Extension version check failed', error);
      });
  }, [isSignedIn]);
};

export default useExtensionOutdated;
