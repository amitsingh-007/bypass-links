import { getEnv } from "./env";

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
