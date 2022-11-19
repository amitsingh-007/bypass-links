import { getEnv } from './env';

export const getFullDbPath = (
  ref: string,
  uid?: string,
  isAbsolute = false
) => {
  if (isAbsolute) {
    return ref;
  }
  const env = getEnv();
  return `${env}/${uid}/${ref}`;
};

export const getStoragePath = async (ref: string, uid: string) => {
  const env = __PROD__ ? 'prod' : 'dev';
  return `${uid}/${env}/${ref}`;
};
