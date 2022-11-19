import { ReactElement } from 'react';
import DynamicContext from '@common/provider/DynamicContext';
import { useRouter } from 'next/router';
import { getFromLocalStorage, setToLocalStorage } from './utils';

const DynamicProvider = ({ children }: { children: ReactElement }) => {
  const router = useRouter();

  const push = (url: string) => router.push(url);
  const storage = {
    get: getFromLocalStorage,
    set: setToLocalStorage,
  };

  return (
    <DynamicContext.Provider value={{ push, storage }}>
      {children}
    </DynamicContext.Provider>
  );
};

export default DynamicProvider;
