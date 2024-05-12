import { DynamicContext } from '@bypass/shared';
import { PropsWithChildren, useMemo } from 'react';
import { useLocation, useSearch } from 'wouter';
import { getFromChromeStorage, setToChromeStorage } from './utils';

const DynamicProvider = ({ children }: PropsWithChildren) => {
  const [, navigate] = useLocation();
  const search = useSearch();

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
    }),
    [navigate, search]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
};

export default DynamicProvider;
