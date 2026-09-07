import path from 'node:path';

import { getPersonImageName, type IPersons, EStorageKey } from '@bypass/shared';

import {
  getFromFirebase,
  listFilesFromFirebase,
  removeFileFromFirebase,
} from './firebaseAdminService';

async function getPersonStorageImageId(uid: string): Promise<string[]> {
  const files = await listFilesFromFirebase(uid);

  return files.map((file) => path.parse(file.name).name);
}

export const cleanupStorage = async (uid: string): Promise<void> => {
  const imageUids = await getPersonStorageImageId(uid);
  const personRecordUids = await getFromFirebase<IPersons>({
    ref: EStorageKey.persons,
    uid,
    fallback: {},
  });
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
