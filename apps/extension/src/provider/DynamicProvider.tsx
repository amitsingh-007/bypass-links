import { DynamicContext } from '@bypass/shared';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFromChromeStorage, setToChromeStorage } from './utils';

const DynamicProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const ctx = useMemo(
    () => ({
      location: {
        push: navigate,
        query: () => location.search,
        goBack: () => navigate(-1),
      },
      storage: {
        get: getFromChromeStorage,
        set: setToChromeStorage,
      },
    }),
    [location.search, navigate]
  );

  return (
    <DynamicContext.Provider value={ctx}>{children}</DynamicContext.Provider>
  );
};

export default DynamicProvider;
