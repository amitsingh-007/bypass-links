import { ReactElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DynamicContext from '@common/provider/DynamicContext';
import { getFromChromeStorage, setToChromeStorage } from './utils';

const DynamicProvider = ({ children }: { children: ReactElement }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const locationObj = {
    push: navigate,
    query: () => location.search,
    goBack: () => navigate(-1),
  };
  const storageObj = {
    get: getFromChromeStorage,
    set: setToChromeStorage,
  };

  return (
    <DynamicContext.Provider
      value={{ location: locationObj, storage: storageObj }}
    >
      {children}
    </DynamicContext.Provider>
  );
};

export default DynamicProvider;
