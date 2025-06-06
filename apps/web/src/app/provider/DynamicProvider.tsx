import { DynamicContext } from '@bypass/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { type PropsWithChildren, useMemo } from 'react';
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
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        get: async (key: string) => getFromLocalStorage(key) as any,
        set: async (key: string, value: any) => setToLocalStorage(key, value),
      },
    }),
    [router, searchParams]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
}

export default DynamicProvider;
