import useFirebaseStore from '@/store/firebase/useFirebaseStore';
import wretch from 'wretch';

export const wretchApi = async () => {
  const { getIdToken } = useFirebaseStore.getState();

  return wretch(`${HOST_NAME}/api`).auth(`Bearer ${await getIdToken()}`);
};
