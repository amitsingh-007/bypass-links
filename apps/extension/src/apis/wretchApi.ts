import wretch from 'wretch';
import { GLOBALS } from '@bypass/shared';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

export const wretchApi = async () => {
  const { getIdToken } = useFirebaseStore.getState();

  return wretch(`${GLOBALS.HOST_NAME}/api`).auth(
    `Bearer ${await getIdToken()}`
  );
};
