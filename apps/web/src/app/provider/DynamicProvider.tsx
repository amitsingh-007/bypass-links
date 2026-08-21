import { DynamicContext } from '@bypass/shared';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren } from 'react';

import { getFaviconUrl } from '../constants/favicon';
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';

const openNewTab = (url: string) => {
  // `noopener` makes window.open return null by spec, so there is no handle to focus
  window.open(url, '_blank', 'noopener,noreferrer');
};

function DynamicProvider({ children }: PropsWithChildren) {
  const router = useRouter();

  const ctx = {
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
  };

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
}

export default DynamicProvider;
