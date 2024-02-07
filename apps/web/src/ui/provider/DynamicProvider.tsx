import { DynamicContext } from '@bypass/shared';
import { useRouter } from 'next/router';
import { PropsWithChildren, useMemo } from 'react';
import { getFromLocalStorage, setToLocalStorage } from './utils';

const DynamicProvider = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  const ctx = useMemo(
    () => ({
      location: {
        push: (url: string) => router.push(url),
        query: () => new URLSearchParams(router.query as any).toString(),
        goBack: router.back,
      },
      storage: {
        get: getFromLocalStorage,
        set: setToLocalStorage,
      },
    }),
    [router]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
};

export default DynamicProvider;
