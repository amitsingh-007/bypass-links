import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import RouterContext from '@common/provider/RouterContext';

const RouterProvider = ({ children }: { children: ReactElement }) => {
  const navigate = useNavigate();

  return (
    <RouterContext.Provider value={{ push: navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export default RouterProvider;
