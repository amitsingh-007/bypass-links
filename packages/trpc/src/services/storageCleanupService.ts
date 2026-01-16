import { type IPersons } from '@bypass/shared';
import { EFirebaseDBRef } from '../constants/firebase';
import {
  deletePersonImageFromFirebase,
  getFromFirebase,
  listFilesFromFirebase,
} from './firebaseAdminService';

async function getPersonStorageImageId(uid: string): Promise<string[]> {
  const files = await listFilesFromFirebase(uid);

  return files.map((file) => {
    const fileName = file.name.split('/').pop() ?? '';
    return fileName.split('.')[0];
  });
}

export const cleanupStorage = async (uid: string): Promise<void> => {
  const imageUids = await getPersonStorageImageId(uid);
  const personRecordUids = await getFromFirebase<IPersons>({
    ref: EFirebaseDBRef.persons,
    uid,
  });
  const orphanedImages = imageUids.filter(
    (imageUid) => !personRecordUids[imageUid]
  );

  if (orphanedImages.length === 0) {
    return;
  }

  await Promise.all(
    orphanedImages.map(async (imageUid) => {
      await deletePersonImageFromFirebase(uid, imageUid);
    })
  );
};
