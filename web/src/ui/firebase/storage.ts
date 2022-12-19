import { getStoragePath } from '@bypass/common/utils/firebase';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import firebaseApp from '.';

const storage = getStorage(firebaseApp);

export const getImageFromFirebase = async (bucketPath: string, uid: string) => {
  const path = ref(storage, await getStoragePath(bucketPath, uid));
  return getDownloadURL(path);
};
