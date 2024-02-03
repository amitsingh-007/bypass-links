import { wretchApi } from '@/apis/wretchApi';

export const uploadFileToFirebase = async (blob: Blob, fileName: string) => {
  const formData = new FormData();
  formData.append('file', blob, fileName);

  const wretch = await wretchApi();
  await wretch.body(formData).post(null, '/upload-file').text();
};
