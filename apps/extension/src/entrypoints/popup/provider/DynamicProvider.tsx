import { DynamicContext, getGoogleFaviconUrl } from '@bypass/shared';
import { type PropsWithChildren, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';

import useHistoryStore from '@store/history';

import { getFromChromeStorage, setToChromeStorage } from './utils';

function DynamicProvider({ children }: PropsWithChildren) {
  const [, navigate] = useLocation();
  const search = useSearch();
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );

  const ctx = useMemo(
    () => ({
      location: {
        push: (url: string) => navigate(url),
        query: () => search,
        goBack: () => window.history.back(),
      },
      storage: {
        get: getFromChromeStorage,
        set: setToChromeStorage,
      },
      tabs: {
        // Arming the watcher before opening is the invariant this seam exists
        // to enforce; startHistoryMonitor is idempotent so looping callers can
        // call this per url
        open: (url: string) => {
          startHistoryMonitor();
          browser.tabs.create({ url, active: false });
        },
      },
      favicon: { getUrl: getGoogleFaviconUrl },
    }),
    [navigate, search, startHistoryMonitor]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
}

export default DynamicProvider;
