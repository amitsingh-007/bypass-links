import { FIREBASE_DB_ROOT_KEYS } from '@bypass/shared';
import { getFromFirebase, saveToFirebase } from './firebaseAdminService';
import { getAssetsByReleaseId, getLatestRelease } from './githubService';

export const getLatestExtension = async () => {
  const { data: latestRelease } = await getLatestRelease();
  const { data: assets } = await getAssetsByReleaseId(latestRelease.id);
  const [extension] = assets.filter(
    (asset) => asset.content_type === 'application/zip'
  );
  return extension;
};

export const backupData = async () => {
  const snapshot = await getFromFirebase({
    ref: FIREBASE_DB_ROOT_KEYS.data,
    isAbsolute: true,
  });
  await saveToFirebase({
    ref: FIREBASE_DB_ROOT_KEYS.backup,
    data: snapshot.val(),
    isAbsolute: true,
  });
};
