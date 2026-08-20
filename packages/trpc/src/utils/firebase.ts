import filenamify from 'filenamify';

export const getFullDbPath = (ref: string, uid?: string) =>
  `/data/${uid}/${ref}`;

export const getBucketPath = (uid: string) => `${uid}/persons`;

export const getFilePath = (uid: string, fileName: string) => {
  const trimmed = fileName.trim();
  const sanitized = filenamify(trimmed);

  // Validate that sanitization produced a non-empty result
  if (!sanitized) {
    throw new Error(
      'Invalid filename: filename cannot be empty or contain only invalid characters'
    );
  }

  return `${getBucketPath(uid)}/${sanitized}`;
};
