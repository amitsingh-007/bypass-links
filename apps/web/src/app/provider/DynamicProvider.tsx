import { DynamicContext } from '@bypass/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { type PropsWithChildren, useMemo } from 'react';

import { faviconUrl } from '@app/constants/favicon';

import { openNewTab } from '../utils';
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';

function DynamicProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ctx = useMemo(
    () => ({
      location: {
        push: (url: string) => router.push(url),
        query: () => searchParams?.toString() ?? '',
        goBack: () => router.back(),
      },
      storage: {
        get: async <T,>(key: string) => getFromLocalStorage<T>(key),
        set: async (key: string, value: any) => setToLocalStorage(key, value),
      },
      tabs: { open: openNewTab },
      favicon: { getUrl: faviconUrl },
    }),
    [router, searchParams]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
}

export default DynamicProvider;
