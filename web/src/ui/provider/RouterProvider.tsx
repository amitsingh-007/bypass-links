import { ReactElement } from 'react';
import RouterContext from '@common/provider/RouterContext';
import { useRouter } from 'next/router';

const RouterProvider = ({ children }: { children: ReactElement }) => {
  const router = useRouter();

  const push = (url: string) => router.push(url);

  return (
    <RouterContext.Provider value={{ push }}>{children}</RouterContext.Provider>
  );
};

export default RouterProvider;
