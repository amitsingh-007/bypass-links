import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicContext from '@common/provider/DynamicContext';
import { getFromChromeStorage, setToChromeStorage } from './utils';

const DynamicProvider = ({ children }: { children: ReactElement }) => {
  const navigate = useNavigate();
  const storageObj = {
    get: getFromChromeStorage,
    set: setToChromeStorage,
  };

  return (
    <DynamicContext.Provider value={{ push: navigate, storage: storageObj }}>
      {children}
    </DynamicContext.Provider>
  );
};

export default DynamicProvider;
