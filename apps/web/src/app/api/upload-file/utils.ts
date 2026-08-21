import { PERSON_IMAGE_SIZE } from '@bypass/shared';
import sharp from 'sharp';

const getCompressedImage = async (buffer: Buffer, fileSize: number) => {
  return sharp(buffer)
    .resize({ width: PERSON_IMAGE_SIZE, withoutEnlargement: true })
    .jpeg({ quality: fileSize < 50 * 1024 ? 100 : 90 })
    .toBuffer();
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const validateAndProccessFile = async (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // sharp cannot decode a non-image, so a failed decode is the type check.
  // Logged because a genuine processing failure lands here too, as the same 400.
  try {
    return await getCompressedImage(buffer, file.size);
  } catch (error) {
    console.error('Rejected upload, sharp could not process it:', error);
    return null;
  }
};
