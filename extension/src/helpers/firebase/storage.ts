import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { getUserProfile } from "GlobalHelpers/fetchFromStorage";
import firebaseApp from ".";

const getStoragePath = async (ref: string) => {
  const env = __PROD__ ? "prod" : "dev";
  const userProfile = await getUserProfile();
  return `${userProfile.uid}/${env}/${ref}`;
};

const storage = getStorage(firebaseApp);

export const uploadImageToFirebase = async (blob: Blob, bucketPath: string) => {
  const path = ref(storage, await getStoragePath(bucketPath));
  await uploadBytes(path, blob, { contentType: blob.type });
};

export const getImageFromFirebase = async (bucketPath: string) => {
  const path = ref(storage, await getStoragePath(bucketPath));
  return getDownloadURL(path);
};

export const removeImageFromFirebase = async (bucketPath: string) => {
  const path = ref(storage, await getStoragePath(bucketPath));
  await deleteObject(path);
};
