import {
  DynamicContext,
  getYandexFaviconUrl,
  QueryStringContext,
} from '@bypass/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { type PropsWithChildren, useMemo } from 'react';

import { openNewTab } from '../utils';
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';

function DynamicProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams?.toString() ?? '';

  // Deliberately free of `searchParams`, so navigating doesn't rebuild the
  // object every consumer and every storage-bound hook depends on
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
      favicon: { getUrl: getYandexFaviconUrl },
    }),
    [router]
  );

  return (
    <DynamicContext.Provider value={ctx}>
      <QueryStringContext.Provider value={queryString}>
        {children}
      </QueryStringContext.Provider>
    </DynamicContext.Provider>
  );
}

export default DynamicProvider;
