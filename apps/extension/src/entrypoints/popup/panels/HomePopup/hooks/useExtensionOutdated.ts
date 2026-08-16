import { useEffect } from 'react';

import { trpcApi } from '@/apis/trpcApi';
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
    // Rechecked on every open, not cached per session: a release while the
    // browser stays open should raise the badge on the next popup open
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
