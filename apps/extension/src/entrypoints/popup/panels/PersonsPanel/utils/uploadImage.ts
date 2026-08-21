import wretch from 'wretch';

import { env } from '@/constants/env';
import useFirebaseStore from '@/store/firebase/useFirebaseStore';

export const uploadFileToFirebase = async (blob: Blob, fileName: string) => {
  const formData = new FormData();
  formData.append('file', blob, fileName);

  const { getIdToken } = useFirebaseStore.getState();
  await wretch(`${env.NEXT_PUBLIC_HOST_NAME}/api`)
    .auth(`Bearer ${await getIdToken()}`)
    .url('/upload-file')
    .body(formData)
    .post()
    .res();
};
