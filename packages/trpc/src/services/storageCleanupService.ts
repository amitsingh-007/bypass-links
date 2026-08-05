import { getPersonImageName, type IPersons } from '@bypass/shared';

import { EFirebaseDBRef } from '../constants/firebase';
import {
  getFromFirebase,
  listFilesFromFirebase,
  removeFileFromFirebase,
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
  const persons = await getFromFirebase<IPersons>({
    ref: EFirebaseDBRef.persons,
    uid,
  });
  const personRecordUids = persons ?? {};
  const orphanedImages = imageUids.filter(
    (imageUid) => !personRecordUids[imageUid]
  );

  if (orphanedImages.length === 0) {
    return;
  }

  const deletePromises = orphanedImages.map(async (imageUid) =>
    removeFileFromFirebase(uid, getPersonImageName(imageUid))
  );
  await Promise.all(deletePromises);
};
