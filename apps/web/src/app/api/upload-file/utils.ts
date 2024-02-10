import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

const getCompressedImage = async (file: File) => {
  return (
    sharp(Buffer.from(await file.arrayBuffer()))
      // When changing this width, change on client app as well
      .resize({ width: 250, withoutEnlargement: true })
      .jpeg({ quality: file.size < 50 * 1024 ? 100 : 90 })
      .toBuffer()
  );
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const validateAndProccessFile = async (file: File) => {
  // File size check
  if (file.size > MAX_FILE_SIZE) {
    return null;
  }

  // Actual file type validation
  const fileTypeRes = await fileTypeFromBuffer(
    Buffer.from(await file.arrayBuffer())
  );
  if (!fileTypeRes) {
    return null;
  }

  // Process the file
  switch (true) {
    case fileTypeRes.mime.startsWith('image/'):
      return getCompressedImage(file);
    default:
      return null;
  }
};
