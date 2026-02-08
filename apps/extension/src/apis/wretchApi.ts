import wretch from 'wretch';
import { env } from '@/constants/env';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

export const wretchApi = async () => {
  const { getIdToken } = useFirebaseStore.getState();

  return wretch(`${env.NEXT_PUBLIC_HOST_NAME}/api`).auth(
    `Bearer ${await getIdToken()}`
  );
};
