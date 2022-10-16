import { useContext } from 'react';
import RouterContext from '../provider/RouterContext';

const useRouter = () => {
  const { push } = useContext(RouterContext);

  return {
    push,
  };
};

export default useRouter;
