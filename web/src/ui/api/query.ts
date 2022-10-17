import { FIREBASE_DB_REF } from '@common/constants/firebase';
import { useQuery } from '@tanstack/react-query';
import { getFromFirebase } from '../firebase/database';
import useUser from '../hooks/useUser';
import FirebaseKeys from './query.keys';

const useFirebaseDb = <T>(ref: FIREBASE_DB_REF) => {
  const { user } = useUser();
  console.log('inside query', user, ref);
  return useQuery<T, Error>(
    FirebaseKeys.getFromFirebase(ref, user),
    () => getFromFirebase<T>(ref, user),
    {
      staleTime: Infinity,
      enabled: Boolean(user?.uid),
    }
  );
};

export { FirebaseKeys };

const useFirebaseQuery = {
  useFirebaseDb,
};

export default useFirebaseQuery;
