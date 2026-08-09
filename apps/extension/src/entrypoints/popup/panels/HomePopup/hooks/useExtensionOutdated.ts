import { useEffect } from 'react';

import { trpcApi } from '@/apis/trpcApi';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

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

/** A local build ahead of the published release must not be flagged. */
const isNewerVersion = (latest: string, current: string) =>
  latest.localeCompare(current, undefined, { numeric: true }) > 0;

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
          isNewerVersion(
            chromeData.version,
            browser.runtime.getManifest().version
          )
        );
      })
      .catch((error: unknown) => {
        console.error('Extension version check failed', error);
      });
  }, [isSignedIn]);
};

export default useExtensionOutdated;
