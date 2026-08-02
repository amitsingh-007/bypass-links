import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

const getCompressedImage = async (buffer: Buffer, fileSize: number) => {
  return (
    sharp(buffer)
      // When changing this width, change on client app as well
      .resize({ width: 250, withoutEnlargement: true })
      .jpeg({ quality: fileSize < 50 * 1024 ? 100 : 90 })
      .toBuffer()
  );
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const validateAndProccessFile = async (file: File) => {
  // File size check
  if (file.size > MAX_FILE_SIZE) {
    return null;
  }

  // Buffer once: sniffing and compressing both need the bytes, up to 5 MB
  const buffer = Buffer.from(await file.arrayBuffer());

  // Actual file type validation
  const fileTypeRes = await fileTypeFromBuffer(buffer);
  if (!fileTypeRes?.mime.startsWith('image/')) {
    return null;
  }

  return getCompressedImage(buffer, file.size);
};
