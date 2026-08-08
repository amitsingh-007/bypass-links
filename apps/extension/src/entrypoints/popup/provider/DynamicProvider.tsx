import { DynamicContext, getGoogleFaviconUrl } from '@bypass/shared';
import { type PropsWithChildren, useMemo } from 'react';
import { useLocation } from 'wouter';

import useHistoryStore from '@store/history';

import { getFromChromeStorage, setToChromeStorage } from './utils';

function DynamicProvider({ children }: PropsWithChildren) {
  const [, navigate] = useLocation();
  const startHistoryMonitor = useHistoryStore(
    (state) => state.startHistoryMonitor
  );

  // No query string here: it would rebuild ctx on every navigation
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
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
}

export default DynamicProvider;
