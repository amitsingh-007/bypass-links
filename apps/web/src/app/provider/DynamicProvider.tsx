import { DynamicContext } from '@bypass/shared';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren, useMemo } from 'react';
import { getFromLocalStorage, setToLocalStorage } from '../utils/storage';

const DynamicProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ctx = useMemo(
    () => ({
      location: {
        push: (url: string) => router.push(url),
        query: () => searchParams?.toString() ?? '',
        goBack: router.back,
      },
      storage: {
        get: getFromLocalStorage,
        set: setToLocalStorage,
      },
    }),
    [router, searchParams]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
};

export default DynamicProvider;
