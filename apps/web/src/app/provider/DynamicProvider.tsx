import { DynamicContext } from '@bypass/shared';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren, useMemo } from 'react';

import { getFaviconUrl } from '../constants/favicon';
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';

const openNewTab = (url: string) => {
  // `noopener` makes window.open return null by spec, so there is no handle to focus
  window.open(url, '_blank', 'noopener,noreferrer');
};

function DynamicProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  // No query string here: it would rebuild ctx on every navigation
  const ctx = useMemo(
    () => ({
      location: {
        push: (url: string) => router.push(url),
        goBack: () => router.back(),
      },
      storage: {
        get: async <T,>(key: string) => getFromLocalStorage<T>(key),
        set: async (key: string, value: any) => setToLocalStorage(key, value),
      },
      tabs: { open: openNewTab },
      favicon: { getUrl: getFaviconUrl },
    }),
    [router]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
}

export default DynamicProvider;
