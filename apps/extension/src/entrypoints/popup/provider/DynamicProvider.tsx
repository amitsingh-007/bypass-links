import {
  DynamicContext,
  getGoogleFaviconUrl,
  QueryStringContext,
} from '@bypass/shared';
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

  // Deliberately free of `search`, so navigating doesn't rebuild the object
  // every consumer and every storage-bound hook depends on
  const ctx = useMemo(
    () => ({
      location: {
        push: (url: string) => navigate(url),
        goBack: () => window.history.back(),
      },
      storage: {
        get: getFromChromeStorage,
        set: setToChromeStorage,
      },
      tabs: {
        // Idempotent, so loop callers can call this per url
        open: (url: string) => {
          startHistoryMonitor();
          browser.tabs.create({ url, active: false });
        },
      },
      favicon: { getUrl: getGoogleFaviconUrl },
    }),
    [navigate, startHistoryMonitor]
  );

  return (
    <DynamicContext.Provider value={ctx}>
      <QueryStringContext.Provider value={search}>
        {children}
      </QueryStringContext.Provider>
    </DynamicContext.Provider>
  );
}

export default DynamicProvider;
