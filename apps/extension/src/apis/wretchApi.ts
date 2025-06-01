import wretch from 'wretch';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

export const wretchApi = async () => {
  const { getIdToken } = useFirebaseStore.getState();

  return wretch(`${HOST_NAME}/api`).auth(`Bearer ${await getIdToken()}`);
};
