import { ReactElement } from 'react';
import DynamicContext from '@bypass/common/provider/DynamicContext';
import { useRouter } from 'next/router';
import { getFromLocalStorage, setToLocalStorage } from './utils';

const DynamicProvider = ({ children }: { children: ReactElement }) => {
  const router = useRouter();

  const location = {
    push: (url: string) => router.push(url),
    query: () => new URLSearchParams(router.query as any).toString(),
    goBack: router.back,
  };

  const storage = {
    get: getFromLocalStorage,
    set: setToLocalStorage,
  };

  return (
    <DynamicContext.Provider value={{ location, storage }}>
      {children}
    </DynamicContext.Provider>
  );
};

export default DynamicProvider;
