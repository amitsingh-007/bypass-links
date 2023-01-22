import { getStoragePath } from '@bypass/shared';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { getUserProfile } from '@helpers/fetchFromStorage';
import firebaseApp from '.';

const getPath = async (_ref: string) => {
  const userProfile = await getUserProfile();
  return getStoragePath(_ref, userProfile.uid ?? '');
};

const storage = getStorage(firebaseApp);

export const uploadImageToFirebase = async (blob: Blob, bucketPath: string) => {
  const path = ref(storage, await getPath(bucketPath));
  await uploadBytes(path, blob, { contentType: blob.type });
};

export const getImageFromFirebase = async (bucketPath: string) => {
  const path = ref(storage, await getPath(bucketPath));
  return getDownloadURL(path);
};

export const removeImageFromFirebase = async (bucketPath: string) => {
  const path = ref(storage, await getPath(bucketPath));
  await deleteObject(path);
};
